"use client";
import CountUp from "react-countup";

export default function AnimatedCount({ value, duration = 2 }:{ value: string; duration?: number }) {
  const numeric = Number((value || "0").toString().replace(/\D/g, ""));
  const showPlus = /\+$/.test(value);
  return (<><CountUp end={numeric} duration={duration} />{showPlus && "+"}</>);
}
