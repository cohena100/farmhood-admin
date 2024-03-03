"use client";

import { submitForm } from "@/lib/actions";
import { useFormState, useFormStatus } from "react-dom";
import { Alert, Button } from "flowbite-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const initialState = {
  success: true,
  message: "",
};

interface SubmitButtonProps {
  className: string | null;
  label: string;
}

export function SubmitButton({ className, label }: SubmitButtonProps) {
  const [state, formAction] = useFormState(submitForm, initialState);
  const { pending } = useFormStatus();
  const [message, setMessage] = useState(false);
  useEffect(() => {
    if (state.message) {
      setMessage(true);
      const timeoutId = setTimeout(() => {
        state.message = "";
        setMessage(false);
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [state]);
  return pending ? (
    <Button
      formAction={formAction}
      className={cn(className)}
      aria-disabled
      isProcessing
      gradientDuoTone="pinkToOrange"
    >
      {label}
    </Button>
  ) : (
    <>
      {message && (
        <Alert
          className="self-start"
          color={state.success ? "success" : "failure"}
        >
          {state.message}
        </Alert>
      )}
      <Button
        type="submit"
        formAction={formAction}
        gradientDuoTone="pinkToOrange"
        className={cn(className)}
      >
        {label}
      </Button>
    </>
  );
}
