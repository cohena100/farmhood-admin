"use client";

import { closeOrder } from "@/lib/actions";
import { useFormState, useFormStatus } from "react-dom";
import { Alert, Button } from "flowbite-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useTransition } from "react";

const initialState = {
  success: true,
  message: "",
};

interface ActionButtonProps {
  className: string | null;
  label: string;
  id: string;
}

export function ActionButton({ className, label, id }: ActionButtonProps) {
  const [pending, startTransition] = useTransition();
  return pending ? (
    <Button
      className={cn(className)}
      aria-disabled
      isProcessing
      gradientDuoTone="pinkToOrange"
    >
      {label}
    </Button>
  ) : (
    <>
      <Button
        onClick={async () => {
          startTransition(async () => {
            await closeOrder(id);
          });
        }}
        className={cn(className)}
        gradientDuoTone="pinkToOrange"
      >
        {label}
      </Button>
    </>
  );
}
