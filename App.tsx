import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { StoreProvider, useStore } from './lib/store';
import { colors } from './lib/theme';
import {
  CustomerTabParamList,
  RiderTabParamList,
  RootStackParamList,
  VendorTabParamList,
} from './lib/navigation';
import RoleSelectScreen from './screens/RoleSelectScreen';
import HomeScreen from './screens/customer/HomeScreen';
import OrdersScreen from './screens/customer/OrdersScreen';
import CartScreen from './screens/customer/CartScreen';
import AccountScreen from './screens/customer/AccountScreen';
import VendorListScreen from './screens/customer/VendorListScreen';
import VendorDetailScreen from './screens/customer/VendorDetailScreen';
import CheckoutScreen from './screens/customer/CheckoutScreen';
import TrackOrderScreen from './screens/customer/TrackOrderScreen';
import NeighborhoodPickerScreen from './screens/NeighborhoodPickerScreen';
import VendorOrdersScreen from './screens/vendor/VendorOrdersScreen';
import VendorMenuScreen from './screens/vendor/VendorMenuScreen';
import VendorInsightsScreen from './screens/vendor/VendorInsightsScreen';
import ItemEditorScreen from './screens/vendor/ItemEditorScreen';
import RiderGoScreen from './screens/rider/RiderGoScreen';
import RiderJobsScreen from './screens/rider/RiderJobsScreen';
import RiderEarningsScreen from './screens/rider/RiderEarningsScreen';
import RiderJobScreen from './screens/rider/RiderJobScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const CustomerTabsNav = createBottomTabNavigator<CustomerTabParamList>();
const VendorTabsNav = createBottomTabNavigator<VendorTabParamList>();
const RiderTabsNav = createBottomTabNavigator<RiderTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.paper,
    card: colors.white,
    text: colors.ink,
    border: colors.line,
    primary: colors.primary,
  },
};

function tabIcon(name: keyof typeof Ionicons.glyphMap, focused: boolean, color: string) {
  return <Ionicons name={name} size={focused ? 24 : 22} color={color} />;
}

function CustomerTabs() {
  const { cartCount } = useStore();
  return (
    <CustomerTabsNav.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
        tabBarStyle: { borderTopColor: colors.line, height: 62, paddingBottom: 8, paddingTop: 6 },
      }}
    >
      <CustomerTabsNav.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => tabIcon(focused ? 'home' : 'home-outline', focused, color),
        }}
      />
      <CustomerTabsNav.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused, color }) => tabIcon(focused ? 'receipt' : 'receipt-outline', focused, color),
        }}
      />
      <CustomerTabsNav.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: 'Cart',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, fontSize: 10 },
          tabBarIcon: ({ focused, color }) => tabIcon(focused ? 'bag-handle' : 'bag-handle-outline', focused, color),
        }}
      />
      <CustomerTabsNav.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{
          title: 'Account',
          tabBarIcon: ({ focused, color }) => tabIcon(focused ? 'person' : 'person-outline', focused, color),
        }}
      />
    </CustomerTabsNav.Navigator>
  );
}

function VendorTabs() {
  return (
    <VendorTabsNav.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
        tabBarStyle: { borderTopColor: colors.line, height: 62, paddingBottom: 8, paddingTop: 6 },
      }}
    >
      <VendorTabsNav.Screen
        name="VendorOrdersTab"
        component={VendorOrdersScreen}
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused, color }) => tabIcon(focused ? 'file-tray' : 'file-tray-outline', focused, color),
        }}
      />
      <VendorTabsNav.Screen
        name="VendorMenuTab"
        component={VendorMenuScreen}
        options={{
          title: 'Catalog',
          tabBarIcon: ({ focused, color }) => tabIcon(focused ? 'fast-food' : 'fast-food-outline', focused, color),
        }}
      />
      <VendorTabsNav.Screen
        name="VendorInsightsTab"
        component={VendorInsightsScreen}
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused, color }) => tabIcon(focused ? 'stats-chart' : 'stats-chart-outline', focused, color),
        }}
      />
    </VendorTabsNav.Navigator>
  );
}

function RiderTabs() {
  return (
    <RiderTabsNav.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.riderMuted,
        tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.riderBg,
          borderTopColor: colors.riderLine,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <RiderTabsNav.Screen
        name="RiderGoTab"
        component={RiderGoScreen}
        options={{
          title: 'Go',
          tabBarIcon: ({ focused, color }) => tabIcon(focused ? 'navigate' : 'navigate-outline', focused, color),
        }}
      />
      <RiderTabsNav.Screen
        name="RiderJobsTab"
        component={RiderJobsScreen}
        options={{
          title: 'Jobs',
          tabBarIcon: ({ focused, color }) => tabIcon(focused ? 'list' : 'list-outline', focused, color),
        }}
      />
      <RiderTabsNav.Screen
        name="RiderEarningsTab"
        component={RiderEarningsScreen}
        options={{
          title: 'Pay',
          tabBarIcon: ({ focused, color }) => tabIcon(focused ? 'wallet' : 'wallet-outline', focused, color),
        }}
      />
    </RiderTabsNav.Navigator>
  );
}

function RootNav() {
  const { ready, role } = useStore();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const start =
    role === 'vendor' ? 'VendorTabs' : role === 'rider' ? 'RiderTabs' : role === 'customer' ? 'CustomerTabs' : 'RoleSelect';

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator
        initialRouteName={start}
        screenOptions={{
          headerTitleStyle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17 },
          headerShadowVisible: false,
          headerTintColor: colors.ink,
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <RootStack.Screen name="RoleSelect" component={RoleSelectScreen} options={{ headerShown: false }} />
        <RootStack.Screen name="CustomerTabs" component={CustomerTabs} options={{ headerShown: false }} />
        <RootStack.Screen name="VendorTabs" component={VendorTabs} options={{ headerShown: false }} />
        <RootStack.Screen name="RiderTabs" component={RiderTabs} options={{ headerShown: false }} />
        <RootStack.Screen
          name="VendorList"
          component={VendorListScreen}
          options={({ route }) => ({ title: route.params.title })}
        />
        <RootStack.Screen name="VendorDetail" component={VendorDetailScreen} options={{ title: 'Vendor' }} />
        <RootStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
        <RootStack.Screen name="TrackOrder" component={TrackOrderScreen} options={{ title: 'Track order' }} />
        <RootStack.Screen
          name="NeighborhoodPicker"
          component={NeighborhoodPickerScreen}
          options={{ title: 'Delivery zone' }}
        />
        <RootStack.Screen
          name="ItemEditor"
          component={ItemEditorScreen}
          options={{ title: 'Catalog item' }}
        />
        <RootStack.Screen
          name="RiderJob"
          component={RiderJobScreen}
          options={{
            title: 'Job',
            headerStyle: { backgroundColor: colors.riderBg },
            headerTintColor: colors.white,
            headerTitleStyle: { fontFamily: 'Poppins_600SemiBold', color: colors.white },
            contentStyle: { backgroundColor: colors.riderBg },
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <StatusBar style="dark" />
          <RootNav />
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
