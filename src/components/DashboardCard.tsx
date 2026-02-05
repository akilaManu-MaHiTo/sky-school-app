import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

export type CardVariant = "default" | "elevated" | "outlined" | "gradient" | "minimal";
export type TrendDirection = "up" | "down" | "flat";

interface DashboardCardProps {
  title?: string;
  titleIcon?: ReactNode;
  caption?: string;
  value?: string | number;
  subDescription?: string;
  variant?: CardVariant;
  trend?: TrendDirection;
  trendValue?: string;
  accentColor?: string;
  onClick?: () => void;
}

function DashboardCard({
  title,
  titleIcon,
  caption,
  value,
  subDescription,
  variant = "default",
  trend,
  trendValue,
  accentColor,
  onClick,
}: DashboardCardProps) {
  const getVariantStyles = () => {
    const baseStyles = {
      backgroundColor: "#fff",
      width: "100%",
      padding: "1.5rem",
      borderRadius: "4px",
      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      flexDirection: "column" as const,
      gap: "1rem",
      cursor: onClick ? "pointer" : "default",
      position: "relative" as const,
      overflow: "hidden",
    };

    switch (variant) {
      case "elevated":
        return {
          ...baseStyles,
          boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          border: "none",
          "&:hover": {
            boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.15), 0 8px 10px -4px rgba(0, 0, 0, 0.06)",
            transform: "translateY(-4px)",
          },
        };
      case "outlined":
        return {
          ...baseStyles,
          boxShadow: "none",
          border: "2px solid var(--pallet-border-blue)",
          "&:hover": {
            borderColor: "var(--pallet-blue)",
            boxShadow: "0 0 0 4px rgba(var(--pallet-blue-rgb, 59, 130, 246), 0.1)",
          },
        };
      case "gradient":
        return {
          ...baseStyles,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: accentColor || "linear-gradient(90deg, var(--pallet-blue) 0%, #60a5fa 100%)",
            borderRadius: "16px 16px 0 0",
          },
          "&:hover": {
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
            transform: "translateY(-2px)",
          },
        };
      case "minimal":
        return {
          ...baseStyles,
          boxShadow: "none",
          border: "none",
          backgroundColor: "#f8fafc",
          padding: "1.25rem",
          "&:hover": {
            backgroundColor: "#f1f5f9",
          },
        };
      default:
        return {
          ...baseStyles,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--pallet-border-blue)",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.04)",
            transform: "translateY(-2px)",
          },
        };
    }
  };

  const getTrendIcon = () => {
    const iconStyles = { fontSize: "1rem" };
    switch (trend) {
      case "up":
        return <TrendingUpIcon sx={{ ...iconStyles, color: "#10b981" }} />;
      case "down":
        return <TrendingDownIcon sx={{ ...iconStyles, color: "#ef4444" }} />;
      case "flat":
        return <TrendingFlatIcon sx={{ ...iconStyles, color: "#6b7280" }} />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "#10b981";
      case "down":
        return "#ef4444";
      case "flat":
        return "#6b7280";
      default:
        return "var(--pallet-text-secondary)";
    }
  };

  return (
    <Box sx={getVariantStyles()} onClick={onClick}>
      {/* Decorative Background Pattern for Gradient Variant */}
      {variant === "gradient" && (
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: accentColor
              ? `${accentColor}08`
              : "rgba(var(--pallet-blue-rgb, 59, 130, 246), 0.04)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "0.875rem", flex: 1 }}>
          {titleIcon && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: accentColor
                  ? `${accentColor}12`
                  : "rgba(var(--pallet-blue-rgb, 59, 130, 246), 0.08)",
                flexShrink: 0,
                transition: "all 0.2s ease",
                "& svg": {
                  fontSize: "1.5rem",
                  color: accentColor || "var(--pallet-blue)",
                },
              }}
            >
              {titleIcon}
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {title && (
              <Typography
                variant="subtitle2"
                sx={{
                  color: "var(--pallet-text-primary)",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  lineHeight: 1.4,
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </Typography>
            )}
            {caption && (
              <Typography
                variant="caption"
                sx={{
                  color: "var(--pallet-text-secondary)",
                  fontSize: "0.8125rem",
                  display: "block",
                  marginTop: "0.25rem",
                  lineHeight: 1.4,
                  opacity: 0.8,
                }}
              >
                {caption}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Trend Badge */}
        {trend && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.375rem 0.625rem",
              borderRadius: "20px",
              backgroundColor:
                trend === "up"
                  ? "rgba(16, 185, 129, 0.1)"
                  : trend === "down"
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(107, 114, 128, 0.1)",
              flexShrink: 0,
            }}
          >
            {getTrendIcon()}
            {trendValue && (
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: getTrendColor(),
                }}
              >
                {trendValue}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Value Section */}
      {value !== undefined && value !== null && (
        <Box
          sx={{
            paddingTop: "0.5rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: accentColor || "var(--pallet-blue)",
              fontWeight: 700,
              fontSize: "2.25rem",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              fontFeatureSettings: '"tnum"',
            }}
          >
            {value}
          </Typography>
        </Box>
      )}

      {/* Footer Section */}
      {subDescription && (
        <Box
          sx={{
            paddingTop: "0.75rem",
            borderTop: "1px solid rgba(0, 0, 0, 0.06)",
            marginTop: "auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "var(--pallet-text-secondary)",
              fontSize: "0.8125rem",
              lineHeight: 1.5,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {subDescription}
          </Typography>
        </Box>
      )}

      {/* Accent Bar for Outlined Variant */}
      {variant === "outlined" && accentColor && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "4px",
            height: "40%",
            backgroundColor: accentColor,
            borderRadius: "0 4px 4px 0",
          }}
        />
      )}
    </Box>
  );
}

export default DashboardCard;
