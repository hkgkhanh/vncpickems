"use client";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";

import {
  backendStringToDate,
  dateToBackendString,
} from "@/lib/datetime_utils";

registerLocale("vi", vi);

export default function EditableDateTime({
  label,
  value,
  onChange,
  tooltip,
}) {
  return (
    <div className="flex items-center gap-4">
      <Tippy content={tooltip}>
        <label className="w-40 shrink-0 cursor-help font-medium">
          {label}
        </label>
      </Tippy>

      <div className="flex flex-1">
        <DatePicker
          selected={backendStringToDate(value)}
          onChange={(date) => onChange(dateToBackendString(date))}
          showTimeSelect
          timeIntervals={30}
          locale="vi"
          dateFormat="dd/MM/yyyy HH:mm"
          timeFormat="HH:mm"
          wrapperClassName="w-full"
          className="w-full rounded border px-3 py-2"
        />
      </div>
    </div>
  );
}