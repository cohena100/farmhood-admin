"use client";

import { ChangeEvent, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/navigation";
import { Select } from "flowbite-react";

interface Props {
  defaultValue: string;
  options: { id: string; name: string }[];
  searchParam: string;
}

export default function OrderSelect({
  defaultValue,
  options,
  searchParam,
}: Props) {
  const [pending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams);
    const id = event.target.value;
    if (event.target.value === "1") {
      params.delete(searchParam);
    } else {
      params.set(searchParam, id);
    }
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <Select
      defaultValue={defaultValue}
      disabled={pending}
      onChange={onSelectChange}
      className="min-w-32"
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </Select>
  );
}
