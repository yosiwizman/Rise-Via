import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  AgeVerification: undefined;
  StateSelection: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Shop: { productId?: string } | undefined;
  Cart: undefined;
  Wishlist: undefined;
  Account: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  ProductDetail: { productId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

declare module '@react-navigation/native' {
  export type RootParamList = RootStackParamList;
}
