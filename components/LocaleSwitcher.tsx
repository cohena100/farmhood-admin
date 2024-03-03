import { useLocale } from "next-intl";
import LocaleSwitcherSelect from "./LocaleSwitcherSelect";

export default function LocaleSwitcher() {
  const locale = useLocale();
  return (
    <LocaleSwitcherSelect defaultValue={locale}>
      <option value="he">עברית</option>
      <option value="en">English</option>
      <option value="ru">Русский</option>
      <option value="de">Deutsch</option>
    </LocaleSwitcherSelect>
  );
}
