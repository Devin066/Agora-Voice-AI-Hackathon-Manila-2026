import fs from "fs";
import path from "path";

const baseDir = path.resolve("c:/Users/adriel magalona/Desktop/Agora/Source Code/frontend/references");

function readText(fileName) {
  return fs.readFileSync(path.join(baseDir, fileName), "utf8");
}

function parseExportSource(source, prefix) {
  const body = source.replace(prefix, "").trim().replace(/;\s*$/, "");
  return Function(`"use strict"; return (${body});`)();
}

const diseases = parseExportSource(readText("Diseases.jsx"), "export const Diseases = ");
const symptoms = parseExportSource(readText("Symptoms.jsx"), "export const Symptoms = ");

const redFlagKeywords = [
  "pain chest",
  "chest tightness",
  "pressure chest",
  "shortness of breath",
  "distress respiratory",
  "labored breathing",
  "gasping for breath",
  "hypoxemia",
  "cyanosis",
  "hypotension",
  "haemorrhage",
  "unresponsiveness",
  "unconscious state",
  "seizure",
  "hemiplegia",
  "facial paresis",
  "speech slurred",
  "dysarthria",
  "st segment elevation",
  "bradycardia",
  "syncope",
  "suicidal",
  "feeling suicidal",
  "hallucinations auditory",
  "blackout",
  "stupor",
  "mental status changes",
  "tachypnea",
  "haemoptysis",
];

function hasAny(symptomList, keywords) {
  return keywords.some((keyword) => symptomList.some((symptom) => symptom.includes(keyword)));
}

function classifyEsi(symptomList) {
  if (
    hasAny(symptomList, [
      "unresponsiveness",
      "unconscious state",
      "pulse absent",
      "gasping for breath",
      "distress respiratory",
      "cyanosis",
      "st segment elevation",
      "haemorrhage",
      "stupor",
    ])
  ) {
    return { esi_level: 1, esi_category: "Resuscitation" };
  }

  if (
    hasAny(symptomList, [
      "pain chest",
      "pressure chest",
      "chest tightness",
      "shortness of breath",
      "hypotension",
      "seizure",
      "hemiplegia",
      "facial paresis",
      "speech slurred",
      "dysarthria",
      "suicidal",
      "feeling suicidal",
      "haemoptysis",
      "syncope",
      "mental status changes",
    ])
  ) {
    return { esi_level: 2, esi_category: "Emergent" };
  }

  if (
    hasAny(symptomList, [
      "fever",
      "vomiting",
      "diarrhea",
      "pain abdominal",
      "tachypnea",
      "wheezing",
      "productive cough",
      "chill",
    ])
  ) {
    return { esi_level: 3, esi_category: "Urgent" };
  }

  if (
    hasAny(symptomList, [
      "pain",
      "cough",
      "headache",
      "nausea",
      "dizziness",
      "swelling",
      "throat sore",
      "pruritus",
    ])
  ) {
    return { esi_level: 4, esi_category: "Semi-Urgent" };
  }

  return { esi_level: 5, esi_category: "Non-Urgent" };
}

const diseasesJson = {};
const diseasesEsi = [];

for (const [disease, symptomList] of Object.entries(diseases)) {
  const cleanSymptoms = (Array.isArray(symptomList) ? symptomList : [])
    .map((symptom) => String(symptom || "").trim())
    .filter(Boolean);
  const lowerSymptoms = cleanSymptoms.map((symptom) => symptom.toLowerCase());
  const redFlagSymptoms = cleanSymptoms.filter((symptom) =>
    redFlagKeywords.some((keyword) => symptom.toLowerCase().includes(keyword))
  );
  const esi = classifyEsi(lowerSymptoms);

  diseasesJson[disease] = cleanSymptoms;
  diseasesEsi.push({
    disease,
    symptoms: cleanSymptoms,
    red_flag_symptoms: [...new Set(redFlagSymptoms)],
    esi_level: esi.esi_level,
    esi_category: esi.esi_category,
  });
}

diseasesEsi.sort((a, b) => a.disease.localeCompare(b.disease));

fs.writeFileSync(path.join(baseDir, "Symptoms.json"), JSON.stringify(symptoms, null, 2));
fs.writeFileSync(path.join(baseDir, "Diseases.json"), JSON.stringify(diseasesJson, null, 2));
fs.writeFileSync(path.join(baseDir, "DiseasesESI.json"), JSON.stringify(diseasesEsi, null, 2));

console.log(`Generated ${Object.keys(diseasesJson).length} diseases and ${symptoms.length} symptoms.`);
