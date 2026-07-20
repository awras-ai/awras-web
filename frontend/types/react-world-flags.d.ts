declare module "react-world-flags" {
  import type { CSSProperties } from "react";

  interface FlagProps {
    code: string;
    height?: string | number;
    width?: string | number;
    className?: string;
    style?: CSSProperties;
    fallback?: React.ReactNode;
  }

  const Flag: React.FC<FlagProps>;
  export default Flag;
}
