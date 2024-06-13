declare interface GenericObject<T> {
  [key: string]: T;
}

declare interface Props {
  children?: React.ReactNode;
}

declare type Nullable<T> = T | null | undefined;
