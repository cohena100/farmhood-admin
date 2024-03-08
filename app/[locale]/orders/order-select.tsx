"use client";

import { ChangeEvent, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/navigation";
import { Select } from "flowbite-react";
import { useTranslations } from "next-intl";

interface Props {
  defaultValue: string;
  options: { id: string; fullname: string }[];
}

export default function OrderSelect({ defaultValue, options }: Props) {
  const t = useTranslations("home");
  const [pending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams);
    const id = event.target.value;
    if (event.target.value) {
      params.set("id", id);
    } else {
      params.delete("id");
    }
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <Select
      defaultValue={defaultValue}
      className="max-w-screen-sm"
      disabled={pending}
      onChange={onSelectChange}
    >
      <option value="">{t("Orders")}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.fullname}
        </option>
      ))}
    </Select>
  );
}
