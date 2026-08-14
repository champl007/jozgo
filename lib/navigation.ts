import { NavigatorScreenParams } from '@react-navigation/native';
import { VendorCategory } from './types';

export type CustomerTabParamList = {
  HomeTab: undefined;
  OrdersTab: undefined;
  CartTab: undefined;
  AccountTab: undefined;
};

export type VendorTabParamList = {
  VendorOrdersTab: undefined;
  VendorMenuTab: undefined;
  VendorInsightsTab: undefined;
};

export type RiderTabParamList = {
  RiderGoTab: undefined;
  RiderJobsTab: undefined;
  RiderEarningsTab: undefined;
};

export type RootStackParamList = {
  RoleSelect: undefined;
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList> | undefined;
  VendorTabs: NavigatorScreenParams<VendorTabParamList> | undefined;
  RiderTabs: NavigatorScreenParams<RiderTabParamList> | undefined;
  VendorList: { category: VendorCategory | 'all'; title: string };
  VendorDetail: { vendorId: string };
  Checkout: undefined;
  TrackOrder: { orderId: string };
  ItemEditor: { itemId?: string };
  RiderJob: { orderId: string };
  NeighborhoodPicker: undefined;
};
