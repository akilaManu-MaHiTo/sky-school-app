import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnVisibilityOption } from "./ColumnVisibilitySelector";

export interface ColumnDefinition {
  key: string;
  label: string;
  defaultVisible?: boolean;
}

export type ColumnVisibilityState = Record<string, boolean>;

interface UseColumnVisibilityOptions {
  columns: ColumnDefinition[];
}

export const useColumnVisibility = ({
  columns,
}: UseColumnVisibilityOptions) => {
  const initialState = useMemo<ColumnVisibilityState>(() => {
    return columns.reduce((acc, column) => {
      acc[column.key] = column.defaultVisible ?? true;
      return acc;
    }, {} as ColumnVisibilityState);
  }, [columns]);

  const [visibility, setVisibility] = useState<ColumnVisibilityState>(initialState);

  useEffect(() => {
    setVisibility((prev) => {
      const next: ColumnVisibilityState = {};
      columns.forEach((column) => {
        next[column.key] =
          prev[column.key] ?? column.defaultVisible ?? true;
      });
      return next;
    });
  }, [columns]);

  const handleToggle = useCallback((key: string, checked: boolean) => {
    setVisibility((prev) => ({
      ...prev,
      [key]: checked,
    }));
  }, []);

  const selectorOptions = useMemo<ColumnVisibilityOption[]>(() => {
    return columns.map((column) => ({
      key: column.key,
      label: column.label,
      checked: visibility[column.key] ?? true,
    }));
  }, [columns, visibility]);

  const selectorProps = useMemo(
    () => ({
      options: selectorOptions,
      onToggle: handleToggle,
    }),
    [selectorOptions, handleToggle]
  );

  return {
    visibility,
    columnSelectorProps: selectorProps,
    toggleColumnVisibility: handleToggle,
    setVisibility,
  };
};

export default useColumnVisibility;
