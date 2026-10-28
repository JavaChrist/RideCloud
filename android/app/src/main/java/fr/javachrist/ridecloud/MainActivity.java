package fr.javachrist.ridecloud;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import fr.javachrist.ridecloud.billing.PlayBillingPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PlayBillingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
