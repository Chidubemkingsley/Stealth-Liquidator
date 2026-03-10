"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Themes                                   */
/* -------------------------------------------------------------------------- */

const THEMES = {
  light: "",
  dark: ".dark",
} as const;

/* -------------------------------------------------------------------------- */
/*                                Chart Config                                */
/* -------------------------------------------------------------------------- */

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

/* -------------------------------------------------------------------------- */
/*                                   Context                                  */
/* -------------------------------------------------------------------------- */

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within <ChartContainer />");
  }
  return context;
}

/* -------------------------------------------------------------------------- */
/*                               Chart Container                              */
/* -------------------------------------------------------------------------- */

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const reactId = React.useId();
  const chartId = `chart-${id ?? reactId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-layer]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});

ChartContainer.displayName = "ChartContainer";

/* -------------------------------------------------------------------------- */
/*                                 Chart Style                                */
/* -------------------------------------------------------------------------- */

const ChartStyle = ({
  id,
  config,
}: {
  id: string;
  config: ChartConfig;
}) => {
  const entries = Object.entries(config).filter(
    ([, v]) => v.color || v.theme
  );

  if (!entries.length) return null;

  const css = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const vars = entries
        .map(([key, value]) => {
          const color =
            value.theme?.[theme as keyof typeof THEMES] ?? value.color;

          return color ? `--color-${key}: ${color};` : "";
        })
        .filter(Boolean)
        .join("\n");

      if (!vars) return "";
      return `${prefix} [data-chart="${id}"] {\n${vars}\n}`;
    })
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};

/* -------------------------------------------------------------------------- */
/*                                  Tooltip                                   */
/* -------------------------------------------------------------------------- */

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
    }
>((props, ref) => {
  const {
    active,
    payload,
    className,
    hideLabel,
    hideIndicator,
    indicator = "dot",
    nameKey,
    labelKey,
  } = props;

  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {payload.map((item, index) => {
        const key =
          (nameKey && item[nameKey as keyof typeof item]) ||
          item.name ||
          item.dataKey ||
          "value";

        const itemConfig = config[String(key)];

        const value =
          typeof item.value === "number"
            ? item.value.toLocaleString()
            : item.value;

        return (
          <div
            key={`${item.dataKey}-${index}`}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              {!hideIndicator && (
                <div
                  className={cn("h-2.5 w-2.5 rounded-sm")}
                  style={{
                    backgroundColor:
                      item.color || `var(--color-${key})`,
                  }}
                />
              )}
              {!hideLabel && (
                <span className="text-muted-foreground">
                  {itemConfig?.label ?? item.name}
                </span>
              )}
            </div>

            <span className="font-mono tabular-nums">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
});

ChartTooltipContent.displayName = "ChartTooltipContent";

/* -------------------------------------------------------------------------- */
/*                                   Legend                                   */
/* -------------------------------------------------------------------------- */

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(({ payload, className, verticalAlign = "bottom", hideIcon }, ref) => {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item, index) => {
        const key = String(item.dataKey ?? "value");
        const itemConfig = config[key];

        return (
          <div
            key={`${key}-${index}`}
            className="flex items-center gap-1.5"
          >
            {!hideIcon && (
              <div
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label ?? item.value}
          </div>
        );
      })}
    </div>
  );
});

ChartLegendContent.displayName = "ChartLegendContent";

/* -------------------------------------------------------------------------- */
/*                                   Export                                   */
/* -------------------------------------------------------------------------- */

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};