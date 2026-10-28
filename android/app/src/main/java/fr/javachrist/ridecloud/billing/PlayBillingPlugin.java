package fr.javachrist.ridecloud.billing;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "PlayBilling")
public class PlayBillingPlugin extends Plugin implements PurchasesUpdatedListener {
    private BillingClient billingClient;
    @Nullable
    private PluginCall pendingPurchase;

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()
            )
            .enableAutoServiceReconnection()
            .build();
        connect(null);
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", billingClient != null && billingClient.isReady());
        call.resolve(result);
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId");
        String obfuscatedAccountId = call.getString("obfuscatedAccountId");
        if (productId == null || productId.isEmpty()) {
            call.reject("PRODUCT_REQUIRED", "Identifiant produit manquant.");
            return;
        }
        pendingPurchase = call;
        ensureReady(() -> queryAndLaunch(call, productId, obfuscatedAccountId));
    }

    @PluginMethod
    public void restorePurchases(PluginCall call) {
        ensureReady(() -> billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build(),
            (billingResult, purchases) -> {
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject(
                        "RESTORE_FAILED",
                        billingResult.getDebugMessage() == null
                            ? "Impossible de restaurer les achats."
                            : billingResult.getDebugMessage()
                    );
                    return;
                }
                JSObject result = new JSObject();
                JSArray list = new JSArray();
                for (Purchase purchase : purchases) {
                    list.put(toJs(purchase));
                }
                result.put("purchases", list);
                call.resolve(result);
            }
        ));
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult billingResult, @Nullable List<Purchase> purchases) {
        PluginCall call = pendingPurchase;
        pendingPurchase = null;
        if (call == null) {
            return;
        }
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            call.reject("USER_CANCELED", "Achat annulé.");
            return;
        }
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            restoreOwnedPurchase(call);
            return;
        }
        if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK
            || purchases == null
            || purchases.isEmpty()) {
            call.reject(
                "PURCHASE_FAILED",
                billingResult.getDebugMessage() == null
                    ? "L'achat Google Play a échoué."
                    : billingResult.getDebugMessage()
            );
            return;
        }
        Purchase purchase = purchases.get(0);
        if (purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED) {
            call.reject("PURCHASE_PENDING", "Paiement Google Play encore en cours.");
            return;
        }
        call.resolve(toJs(purchase));
    }

    private void queryAndLaunch(PluginCall call, String productId, @Nullable String obfuscatedAccountId) {
        QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product.newBuilder()
            .setProductId(productId)
            .setProductType(BillingClient.ProductType.SUBS)
            .build();
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
            .setProductList(Collections.singletonList(product))
            .build();

        billingClient.queryProductDetailsAsync(params, (billingResult, queryResult) -> {
            if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                pendingPurchase = null;
                call.reject(
                    "PRODUCT_QUERY_FAILED",
                    billingResult.getDebugMessage() == null
                        ? "Impossible de lire le produit Google Play."
                        : billingResult.getDebugMessage()
                );
                return;
            }
            List<ProductDetails> details = queryResult.getProductDetailsList();
            if (details == null || details.isEmpty()) {
                pendingPurchase = null;
                call.reject(
                    "PRODUCT_NOT_FOUND",
                    "Produit Google Play introuvable. Vérifiez Play Console."
                );
                return;
            }
            ProductDetails productDetails = details.get(0);
            String offerToken = pickPaidOfferToken(productDetails);
            if (offerToken == null) {
                pendingPurchase = null;
                call.reject("OFFER_NOT_FOUND", "Aucune offre payante disponible pour ce produit.");
                return;
            }

            BillingFlowParams.ProductDetailsParams productParams =
                BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(productDetails)
                    .setOfferToken(offerToken)
                    .build();
            if (getActivity() == null) {
                pendingPurchase = null;
                call.reject("NO_ACTIVITY", "Activité Android indisponible.");
                return;
            }
            BillingFlowParams.Builder flowBuilder = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(productParams));
            if (obfuscatedAccountId != null && !obfuscatedAccountId.isEmpty()) {
                flowBuilder.setObfuscatedAccountId(obfuscatedAccountId);
            }
            getActivity().runOnUiThread(() ->
                billingClient.launchBillingFlow(getActivity(), flowBuilder.build())
            );
        });
    }

    @Nullable
    private String pickPaidOfferToken(ProductDetails productDetails) {
        List<ProductDetails.SubscriptionOfferDetails> offers = productDetails.getSubscriptionOfferDetails();
        if (offers == null || offers.isEmpty()) {
            return null;
        }
        for (ProductDetails.SubscriptionOfferDetails offer : offers) {
            boolean hasFreePhase = false;
            for (ProductDetails.PricingPhase phase : offer.getPricingPhases().getPricingPhaseList()) {
                if (phase.getPriceAmountMicros() == 0) {
                    hasFreePhase = true;
                    break;
                }
            }
            if (!hasFreePhase) {
                return offer.getOfferToken();
            }
        }
        return null;
    }

    private void restoreOwnedPurchase(PluginCall call) {
        billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build(),
            (billingResult, purchases) -> {
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK
                    || purchases == null
                    || purchases.isEmpty()) {
                    call.reject("ITEM_ALREADY_OWNED", "Abonnement déjà détenu. Resynchronisez depuis Paramètres.");
                    return;
                }
                call.resolve(toJs(purchases.get(0)));
            }
        );
    }

    private JSObject toJs(Purchase purchase) {
        JSObject json = new JSObject();
        json.put("purchaseToken", purchase.getPurchaseToken());
        json.put("orderId", purchase.getOrderId());
        List<String> products = purchase.getProducts();
        json.put("productId", products.isEmpty() ? "" : products.get(0));
        return json;
    }

    private void ensureReady(Runnable next) {
        if (billingClient != null && billingClient.isReady()) {
            next.run();
            return;
        }
        connect(next);
    }

    private void connect(@Nullable Runnable onReady) {
        if (billingClient == null) {
            if (pendingPurchase != null) {
                pendingPurchase.reject("BILLING_UNAVAILABLE", "Google Play Billing indisponible.");
                pendingPurchase = null;
            }
            return;
        }
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    if (onReady != null) {
                        onReady.run();
                    }
                    return;
                }
                if (pendingPurchase != null) {
                    pendingPurchase.reject(
                        "BILLING_UNAVAILABLE",
                        billingResult.getDebugMessage() == null
                            ? "Google Play Billing indisponible."
                            : billingResult.getDebugMessage()
                    );
                    pendingPurchase = null;
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // enableAutoServiceReconnection se charge de relancer.
            }
        });
    }
}
