"use client";

import { Popover, PopoverContent, PopoverTrigger, Tooltip } from "@nextui-org/react";
import type { TooltipProps } from "@nextui-org/tooltip";
import { useEffect, useState } from "react";

/**
 * NextUI Tooltip relies on hover/focus; React Aria also closes on pointer down,
 * so hints do not work on touch devices. On (hover: none) we use Popover with press trigger.
 */
export function ResponsiveTooltip({
  children,
  content,
  delay,
  closeDelay,
  trigger,
  isDisabled,
  ...rest
}: TooltipProps) {
  const [mounted, setMounted] = useState(false);
  const [useTouchOverlay, setUseTouchOverlay] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(hover: none)");
    const apply = () => setUseTouchOverlay(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (isDisabled) {
    return <>{children}</>;
  }

  if (!mounted || !useTouchOverlay) {
    return (
      <Tooltip
        isDisabled={isDisabled}
        content={content}
        delay={delay}
        closeDelay={closeDelay}
        trigger={trigger}
        {...rest}
      >
        {children}
      </Tooltip>
    );
  }

  return (
    <Popover
      className={rest.className}
      classNames={rest.classNames}
      color={rest.color}
      size={rest.size}
      radius={rest.radius}
      shadow={rest.shadow}
      placement={rest.placement}
      offset={rest.offset}
      crossOffset={rest.crossOffset}
      shouldFlip={rest.shouldFlip}
      containerPadding={rest.containerPadding}
      showArrow={rest.showArrow}
      portalContainer={rest.portalContainer}
      updatePositionDeps={rest.updatePositionDeps}
      motionProps={rest.motionProps}
      isOpen={rest.isOpen}
      defaultOpen={rest.defaultOpen}
      onOpenChange={rest.onOpenChange}
      shouldCloseOnBlur={rest.shouldCloseOnBlur}
      isDismissable={rest.isDismissable ?? true}
      shouldCloseOnInteractOutside={rest.shouldCloseOnInteractOutside}
      isKeyboardDismissDisabled={rest.isKeyboardDismissDisabled}
      isNonModal
      backdrop="transparent"
      shouldBlockScroll={false}
      onClose={rest.onClose}
    >
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>{content}</PopoverContent>
    </Popover>
  );
}
