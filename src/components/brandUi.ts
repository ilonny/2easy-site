/** Shared brand chrome for forms, CTAs, and NextUI modals. */

export const brandPrimaryBtnClassName =
  "rounded-[14px] bg-brand-violet text-xs font-bold tracking-brand text-white hover:opacity-90 lg:text-sm";

export const brandSecondaryBtnClassName =
  "rounded-[14px] bg-brand-gray text-xs font-bold tracking-brand text-brand-black hover:bg-[#e6e6ea] lg:text-sm";

export const brandDangerBtnClassName =
  "rounded-[14px] bg-transparent text-xs font-bold tracking-brand text-danger hover:bg-danger/10 lg:text-sm";

export const brandInputClassNames = {
  inputWrapper:
    "rounded-[14px] bg-brand-gray shadow-none border-none hover:bg-[#e6e6ea] group-data-[focus=true]:bg-brand-gray group-data-[focus=true]:shadow-none",
  input: "font-bold tracking-brand text-brand-black",
  label: "font-bold tracking-brand text-brand-black",
};

export const brandModalClassNames = {
  base: "bg-white rounded-[20px] lg:rounded-[30px]",
  header:
    "border-b border-black/5 px-5 py-4 text-base font-bold tracking-brand text-brand-black lg:px-6 lg:text-lg",
  body: "px-5 py-5 lg:px-6",
  footer: "border-t border-black/5 px-5 py-4 lg:px-6",
  closeButton:
    "hover:bg-brand-gray active:bg-[#e6e6ea] rounded-[10px] text-brand-black",
};
