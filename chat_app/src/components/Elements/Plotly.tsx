// DISABLED: Charts/Plotly not needed for text-only chat (~3MB saved)
// This component has been disabled as part of performance optimization
// To re-enable: uncomment this file, install react-plotly.js and plotly.js, then update Elements/index.tsx

/*
import { Suspense, lazy } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

import { useFetch } from "hooks/useFetch";

import { type IPlotlyElement } from "@chainlit/react-client";

const Plot = lazy(() => import("react-plotly.js"));

interface Props {
  element: IPlotlyElement;
}

const _PlotlyElement = ({ element }: Props) => {
  const { data, error, isLoading } = useFetch(element.url || null);

  if (isLoading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>An error occurred</div>;
  }

  let state;

  if (data) {
    state = data;
  } else {
    return null;
  }

  return (
    <Suspense fallback={<Skeleton className="h-full rounded-md" />}>
      <Plot
        className={`${element.display}-plotly`}
        data={state.data}
        layout={state.layout}
        frames={state.frames}
        config={state.config}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "1rem",
          overflow: "hidden",
        }}
        useResizeHandler={true}
      />
    </Suspense>
  );
};

const PlotlyElement = (props: Props) => {
  return (
    <ErrorBoundary prefix="Failed to load chart.">
      <_PlotlyElement {...props} />
    </ErrorBoundary>
  );
};

export { PlotlyElement };
*/

// Export a placeholder to maintain type compatibility
export const PlotlyElement = () => null;
