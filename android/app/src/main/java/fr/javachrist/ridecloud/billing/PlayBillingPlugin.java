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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "PlayBilling")
public class PlayBillingPlugin extends Plugin implements PurchasesUpdatedListener {
    private static final String PRODUCT_PREMIUM = "ridecloud_premium";
    private static final String PRODUCT_FAMILY = "ridecloud_family";

    private BillingClient billingClient;
    @Nullable
    private PluginCall pendingPurchase;
    @Nullable
    private PluginCall pendingReady;

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
    public void getOffers(PluginCall call) {
        ensureReady(call, () -> queryOffers(call));
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId");
        String basePlanId = call.getString("basePlanId");
        String obfuscatedAccountId = call.getString("obfuscatedAccountId");
        String oldProductId = call.getString("oldProductId");
        String oldPurchaseToken = call.getString("oldPurchaseToken");
        if (productId == null || productId.isEmpty()) {
            call.reject("PRODUCT_REQUIRED", "Identifiant produit manquant.");
            return;
        }
        if (basePlanId == null || basePlanId.isEmpty()) {
            call.reject("BASE_PLAN_REQUIRED", "Identifiant de plan de base manquant.");
            return;
        }
        pendingPurchase = call;
        ensureReady(call, () -> queryAndLaunch(
            call,
            productId,
            basePlanId,
            obfuscatedAccountId,
            oldProductId,
            oldPurchaseToken
        ));
    }

    @PluginMethod
    public void restorePurchases(PluginCall call) {
        ensureReady(call, () -> billingClient.queryPurchasesAsync(
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

    private void queryOffers(PluginCall call) {
        List<QueryProductDetailsParams.Product> products = new ArrayList<>();
        for (String productId : Arrays.asList(PRODUCT_PREMIUM, PRODUCT_FAMILY)) {
            products.add(
                QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(productId)
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build()
            );
        }
        billingClient.queryProductDetailsAsync(
            QueryProductDetailsParams.newBuilder().setProductList(products).build(),
            (billingResult, queryResult) -> {
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject(
                        "PRODUCT_QUERY_FAILED",
                        billingResult.getDebugMessage() == null
                            ? "Impossible de lire les offres Google Play."
                            : billingResult.getDebugMessage()
                    );
                    return;
                }
                JSObject result = new JSObject();
                JSArray offers = new JSArray();
                List<ProductDetails> details = queryResult.getProductDetailsList();
                if (details != null) {
                    for (ProductDetails productDetails : details) {
                        appendBasePlanOffers(offers, productDetails);
                    }
                }
                result.put("offers", offers);
                call.resolve(result);
            }
        );
    }

    private void appendBasePlanOffers(JSArray offers, ProductDetails productDetails) {
        List<ProductDetails.SubscriptionOfferDetails> details = productDetails.getSubscriptionOfferDetails();
        if (details == null) {
            return;
        }
        for (ProductDetails.SubscriptionOfferDetails offer : details) {
            if (!isRegularBasePlan(offer)) {
                continue;
            }
            List<ProductDetails.PricingPhase> phases = offer.getPricingPhases().getPricingPhaseList();
            if (phases == null || phases.isEmpty()) {
                continue;
            }
            ProductDetails.PricingPhase phase = phases.get(0);
            JSObject row = new JSObject();
            row.put("productId", productDetails.getProductId());
            row.put("basePlanId", offer.getBasePlanId());
            row.put("formattedPrice", phase.getFormattedPrice());
            row.put("priceAmountMicros", phase.getPriceAmountMicros());
            row.put("billingPeriod", phase.getBillingPeriod());
            offers.put(row);
        }
    }

    private void queryAndLaunch(
        PluginCall call,
        String productId,
        String basePlanId,
        @Nullable String obfuscatedAccountId,
        @Nullable String oldProductId,
        @Nullable String oldPurchaseToken
    ) {
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
            ProductDetails.SubscriptionOfferDetails offer = findBasePlanOffer(productDetails, basePlanId);
            if (offer == null) {
                pendingPurchase = null;
                call.reject(
                    "OFFER_NOT_FOUND",
                    "Plan de base Google Play introuvable pour ce produit."
                );
                return;
            }

            BillingFlowParams.ProductDetailsParams.Builder productParams =
                BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(productDetails)
                    .setOfferToken(offer.getOfferToken());
            boolean replace =
                oldProductId != null && !oldProductId.isEmpty()
                    && oldPurchaseToken != null && !oldPurchaseToken.isEmpty();
            if (replace) {
                productParams.setSubscriptionProductReplacementParams(
                    BillingFlowParams.ProductDetailsParams.SubscriptionProductReplacementParams
                        .newBuilder()
                        .setOldProductId(oldProductId)
                        .setReplacementMode(
                            BillingFlowParams.ProductDetailsParams
                                .SubscriptionProductReplacementParams.ReplacementMode.CHARGE_FULL_PRICE
                        )
                        .build()
                );
            }
            if (getActivity() == null) {
                pendingPurchase = null;
                call.reject("NO_ACTIVITY", "Activité Android indisponible.");
                return;
            }
            BillingFlowParams.Builder flowBuilder = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(productParams.build()));
            if (obfuscatedAccountId != null && !obfuscatedAccountId.isEmpty()) {
                flowBuilder.setObfuscatedAccountId(obfuscatedAccountId);
            }
            if (replace) {
                flowBuilder.setSubscriptionUpdateParams(
                    BillingFlowParams.SubscriptionUpdateParams.newBuilder()
                        .setOldPurchaseToken(oldPurchaseToken)
                        .build()
                );
            }
            getActivity().runOnUiThread(() ->
                billingClient.launchBillingFlow(getActivity(), flowBuilder.build())
            );
        });
    }

    @Nullable
    private ProductDetails.SubscriptionOfferDetails findBasePlanOffer(
        ProductDetails productDetails,
        String basePlanId
    ) {
        List<ProductDetails.SubscriptionOfferDetails> offers = productDetails.getSubscriptionOfferDetails();
        if (offers == null) {
            return null;
        }
        for (ProductDetails.SubscriptionOfferDetails offer : offers) {
            if (basePlanId.equals(offer.getBasePlanId()) && isRegularBasePlan(offer)) {
                return offer;
            }
        }
        return null;
    }

    private boolean isRegularBasePlan(ProductDetails.SubscriptionOfferDetails offer) {
        String offerId = offer.getOfferId();
        return offerId == null || offerId.isEmpty();
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

    private void ensureReady(PluginCall call, Runnable next) {
        pendingReady = call;
        if (billingClient != null && billingClient.isReady()) {
            pendingReady = null;
            next.run();
            return;
        }
        connect(() -> {
            pendingReady = null;
            next.run();
        });
    }

    private void rejectPending(String code, String message) {
        PluginCall purchaseCall = pendingPurchase;
        PluginCall readyCall = pendingReady;
        pendingPurchase = null;
        pendingReady = null;
        if (purchaseCall != null) {
            purchaseCall.reject(code, message);
        }
        if (readyCall != null && readyCall != purchaseCall) {
            readyCall.reject(code, message);
        }
    }

    private void connect(@Nullable Runnable onReady) {
        if (billingClient == null) {
            rejectPending("BILLING_UNAVAILABLE", "Google Play Billing indisponible.");
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
                rejectPending(
                    "BILLING_UNAVAILABLE",
                    billingResult.getDebugMessage() == null
                        ? "Google Play Billing indisponible."
                        : billingResult.getDebugMessage()
                );
            }

            @Override
            public void onBillingServiceDisconnected() {
                // enableAutoServiceReconnection se charge de relancer.
            }
        });
    }
}
