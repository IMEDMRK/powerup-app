"use server";

const geoalgeria = require("geoalgeria");

export async function fetchWilayas() {
  return geoalgeria.wilayas.map((w: any) => ({ code: w.code, name_ar: w.name_ar }));
}

export async function fetchCommunes(wilayaCode: number) {
  return geoalgeria.getCommunesByWilaya(wilayaCode).map((c: any) => ({ id: c.id, name_ar: c.name_ar }));
}
