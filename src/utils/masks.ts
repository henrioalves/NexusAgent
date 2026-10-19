export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  // Suporte a formato internacional ou brasileiro
  if (digits.length <= 11) {
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  // Com DDI brasileiro 55
  if (digits.startsWith("55") && digits.length <= 13) {
    const local = digits.slice(2);
    if (local.length <= 2) return `+55 (${local}`;
    if (local.length <= 7) return `+55 (${local.slice(0, 2)}) ${local.slice(2)}`;
    if (local.length <= 10) {
      return `+55 (${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
    }
    return `+55 (${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7, 11)}`;
  }

  // Genérico internacional
  return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
}

export function parseSafeDate(dateStr: string): { day: string; month: string; year: string } {
  if (!dateStr || typeof dateStr !== "string") {
    return { day: "--", month: "--", year: "----" };
  }

  // Trata formato YYYY-MM-DD
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length >= 3) {
      return {
        year: parts[0] || "----",
        month: parts[1] || "--",
        day: parts[2] || "--",
      };
    }
  }

  // Trata formato DD/MM/YYYY
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length >= 3) {
      return {
        day: parts[0] || "--",
        month: parts[1] || "--",
        year: parts[2] || "----",
      };
    }
  }

  return { day: "--", month: "--", year: "----" };
}

export function isTimeValid(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

export function timeToMinutes(time: string): number {
  if (!isTimeValid(time)) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function validateScheduleTimes(
  start: string,
  end: string,
  lunch: boolean,
  lunchStart: string,
  lunchEnd: string
): { valid: boolean; error?: string } {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);

  if (startMin >= endMin) {
    return {
      valid: false,
      error: "O horário de término deve ser posterior ao horário de início.",
    };
  }

  if (lunch) {
    const lunchStartMin = timeToMinutes(lunchStart);
    const lunchEndMin = timeToMinutes(lunchEnd);

    if (lunchStartMin >= lunchEndMin) {
      return {
        valid: false,
        error: "O término do almoço deve ser posterior ao início do almoço.",
      };
    }

    if (lunchStartMin < startMin || lunchEndMin > endMin) {
      return {
        valid: false,
        error: "O intervalo de almoço deve estar contido dentro do horário de expediente.",
      };
    }
  }

  return { valid: true };
}

