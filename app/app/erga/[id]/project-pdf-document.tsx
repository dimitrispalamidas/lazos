"use client";

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Ένα TTF με Latin + Greek – απλή λύση χωρίς MultiScriptText
Font.register({
  family: "NotoSans",
  fonts: [{ src: "/fonts/NotoSans-Regular.ttf", fontWeight: 400 }],
});

export type ProjectForPdf = {
  id: string;
  customer_name: string;
  price_per_meter: number;
  price_metra: number | null;
  sinazi: string | null;
  sinazi_metro: number | null;
  gonies: string | null;
  gonies_metro: number | null;
  owed: number;
  vat_percent?: number | null;
  created_at: string;
  project_income?: { id: string; amount: number; vat_percent: number | null }[];
  project_other_works?: { id: string; name: string; price: number }[];
};

function rowTotal(amount: number, vatPercent: number | null): number {
  if (vatPercent == null || vatPercent === 0) return amount;
  return amount * (1 + vatPercent / 100);
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 10,
    fontFamily: "NotoSans",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  logo: {
    width: 200,
    height: 80,
    objectFit: "contain",
  },
  body: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: "35%",
    color: "#666",
  },
  value: {
    width: "65%",
  },
  table: {
    marginTop: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 6,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#333",
    paddingVertical: 6,
    fontWeight: "bold",
  },
  tableCol1: { width: "50%" },
  tableCol2: { width: "25%" },
  tableCol3: { width: "25%", textAlign: "right" as const },
  /* Εργασίες πίνακας: Είδος | Τιμή (€) | Μέτρα | Σύνολο (€) */
  tableColE1: { width: "22%" },
  tableColE2: { width: "26%", textAlign: "right" as const },
  tableColE3: { width: "26%", textAlign: "right" as const },
  tableColE4: { width: "26%", textAlign: "right" as const },
  /* Άλλες εργασίες: 2 στήλες */
  tableColO1: { width: "70%" },
  tableColO2: { width: "30%", textAlign: "right" as const },
  total: {
    marginTop: 12,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 24,
    fontSize: 8,
    color: "#888",
  },
});

type ProjectPdfDocumentProps = {
  project: ProjectForPdf;
  /** Absolute URL for logo (e.g. origin + LOGO_PATH). Required for image to load in browser PDF. */
  logoSrc?: string;
  /** false = κρύβει ολόκληρο το section πληρωμών & υπολοίπων στο PDF (μόνο useState στον browser). */
  showPaymentsInPdf?: boolean;
};

export function ProjectPdfDocument({
  project,
  logoSrc,
  showPaymentsInPdf = true,
}: ProjectPdfDocumentProps) {
  const paymentRows = showPaymentsInPdf ? (project.project_income ?? []) : [];
  const incomeTotal = paymentRows.reduce(
    (sum, r) => sum + rowTotal(r.amount, r.vat_percent),
    0
  );
  const incomeTotalWithoutVat = paymentRows.reduce(
    (sum, r) => sum + Number(r.amount),
    0
  );
  const otherWorksTotal = (project.project_other_works ?? []).reduce(
    (sum, r) => sum + r.price,
    0
  );
  const merikoTotal =
    Number(project.price_per_meter) * (Number(project.price_metra) || 0) +
    Number(project.sinazi || 0) * (Number(project.sinazi_metro) || 0) +
    Number(project.gonies || 0) * (Number(project.gonies_metro) || 0);
  const genikoTotal = merikoTotal + otherWorksTotal;
  const hasProjectVat = project.vat_percent != null && project.vat_percent !== 0;
  const merikoTotalWithVat = hasProjectVat ? merikoTotal * (1 + (project.vat_percent ?? 0) / 100) : null;
  const genikoTotalWithVat = hasProjectVat ? genikoTotal * (1 + (project.vat_percent ?? 0) / 100) : null;
  const targetTotal = genikoTotalWithVat ?? genikoTotal;
  const ypoloipoKatharo = genikoTotal - incomeTotalWithoutVat;
  const ypoloipo = targetTotal - incomeTotal;
  const fmt = (n: number) =>
    n.toLocaleString("el-GR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Έντυπο Προσφοράς: {project.customer_name}
          </Text>
          {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : <View />}
        </View>

        {/* 1. Εργασίες: πίνακας Είδος | Τιμή | Μέτρα | Σύνολο */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Εργασίες</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableColE1}>Είδος</Text>
              <Text style={styles.tableColE2}>Τιμή (€)</Text>
              <Text style={styles.tableColE3}>Μέτρα</Text>
              <Text style={styles.tableColE4}>Σύνολο (€)</Text>
            </View>
            {((project.price_per_meter != null && Number(project.price_per_meter) !== 0) || (project.price_metra != null && Number(project.price_metra) !== 0)) && (
              <View style={styles.tableRow}>
                <Text style={styles.tableColE1}>Μέτρο</Text>
                <Text style={styles.tableColE2}>{fmt(Number(project.price_per_meter))}</Text>
                <Text style={styles.tableColE3}>{project.price_metra != null ? fmt(Number(project.price_metra)) : "—"}</Text>
                <Text style={styles.tableColE4}>
                  {fmt(Number(project.price_per_meter) * (Number(project.price_metra) || 0))}
                </Text>
              </View>
            )}
            {project.sinazi != null && project.sinazi !== "" && (
              <View style={styles.tableRow}>
                <Text style={styles.tableColE1}>Σινάζι</Text>
                <Text style={styles.tableColE2}>{fmt(Number(project.sinazi))}</Text>
                <Text style={styles.tableColE3}>
                  {project.sinazi_metro != null && Number(project.sinazi_metro) !== 0 ? fmt(Number(project.sinazi_metro)) : "—"}
                </Text>
                <Text style={styles.tableColE4}>
                  {fmt(Number(project.sinazi) * (Number(project.sinazi_metro) || 0))}
                </Text>
              </View>
            )}
            {project.gonies != null && project.gonies !== "" && (
              <View style={styles.tableRow}>
                <Text style={styles.tableColE1}>Γωνίες</Text>
                <Text style={styles.tableColE2}>{fmt(Number(project.gonies))}</Text>
                <Text style={styles.tableColE3}>
                  {project.gonies_metro != null && Number(project.gonies_metro) !== 0 ? fmt(Number(project.gonies_metro)) : "—"}
                </Text>
                <Text style={styles.tableColE4}>
                  {fmt(Number(project.gonies) * (Number(project.gonies_metro) || 0))}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.total}>
            Μερικό Σύνολο (€): {fmt(merikoTotal)}
            {merikoTotalWithVat != null ? ` (με ΦΠΑ: €${fmt(merikoTotalWithVat)})` : ""}
          </Text>

          {(project.project_other_works ?? []).length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 20, fontSize: 11 }]}>Άλλες εργασίες</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableColO1}>Περιγραφή</Text>
                  <Text style={styles.tableColO2}>Τιμή (€)</Text>
                </View>
                {(project.project_other_works ?? []).map((r, i) => (
                  <View key={r.id ?? i} style={styles.tableRow}>
                    <Text style={styles.tableColO1}>{r.name}</Text>
                    <Text style={styles.tableColO2}>{fmt(r.price)}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.total}>
                Σύνολο άλλων εργασιών: €{fmt(otherWorksTotal)}
              </Text>
            </>
          )}

          <Text style={[styles.total, { marginTop: 8 }]}>
            Γενικό Σύνολο (€): {fmt(genikoTotal)}
            {genikoTotalWithVat != null ? ` (με ΦΠΑ: €${fmt(genikoTotalWithVat)})` : ""}
          </Text>
        </View>

        {/* 2. Πληρωμές και υπόλοιπο (προαιρετικό μέσω showPaymentsInPdf) */}
        {showPaymentsInPdf && paymentRows.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Πληρωμές</Text>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCol1}>Ποσό (€)</Text>
              <Text style={styles.tableCol2}>ΦΠΑ %</Text>
              <Text style={styles.tableCol3}>Σύνολο (€)</Text>
            </View>
            {paymentRows.map((r, i) => (
              <View key={r.id ?? i} style={styles.tableRow}>
                <Text style={styles.tableCol1}>{fmt(r.amount)}</Text>
                <Text style={styles.tableCol2}>
                  {r.vat_percent != null ? `${r.vat_percent}%` : "—"}
                </Text>
                <Text style={styles.tableCol3}>
                  {fmt(rowTotal(r.amount, r.vat_percent))}
                </Text>
              </View>
            ))}
            <Text style={styles.total}>
              {incomeTotalWithoutVat !== incomeTotal
                ? `Σύνολο πληρωμών: €${fmt(incomeTotal)} (χωρίς ΦΠΑ: €${fmt(incomeTotalWithoutVat)})`
                : `Σύνολο πληρωμών: €${fmt(incomeTotal)}`}
            </Text>
            <Text style={[styles.total, { marginTop: 8 }]}>
              {`Υπόλοιπο (Γενικό καθαρό (€${fmt(genikoTotal)}) − Καθαρές πληρωμές (€${fmt(incomeTotalWithoutVat)})): €${fmt(ypoloipoKatharo)}`}
            </Text>
            <Text style={[styles.total, { marginTop: 4 }]}>
              {genikoTotalWithVat != null
                ? `Υπόλοιπο (Γενικό με ΦΠΑ (€${fmt(genikoTotalWithVat)}) − Πληρωμές με ΦΠΑ (€${fmt(incomeTotal)})): €${fmt(ypoloipo)}`
                : incomeTotal !== incomeTotalWithoutVat
                  ? `Υπόλοιπο (Γενικό (€${fmt(genikoTotal)}) − Πληρωμές με ΦΠΑ (€${fmt(incomeTotal)})): €${fmt(ypoloipo)}`
                  : `Υπόλοιπο (Γενικό (€${fmt(genikoTotal)}) − Πληρωμές (€${fmt(incomeTotal)})): €${fmt(ypoloipo)}`}
            </Text>
          </View>
        )}

        {showPaymentsInPdf && paymentRows.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.total}>
              {`Υπόλοιπο (Γενικό καθαρό (€${fmt(genikoTotal)}) − Καθαρές πληρωμές (€${fmt(incomeTotalWithoutVat)})): €${fmt(ypoloipoKatharo)}`}
            </Text>
            <Text style={[styles.total, { marginTop: 4 }]}>
              {genikoTotalWithVat != null
                ? `Υπόλοιπο (Γενικό με ΦΠΑ (€${fmt(genikoTotalWithVat)}) − Πληρωμές με ΦΠΑ (€${fmt(incomeTotal)})): €${fmt(ypoloipo)}`
                : incomeTotal !== incomeTotalWithoutVat
                  ? `Υπόλοιπο (Γενικό (€${fmt(genikoTotal)}) − Πληρωμές με ΦΠΑ (€${fmt(incomeTotal)})): €${fmt(ypoloipo)}`
                  : `Υπόλοιπο (Γενικό (€${fmt(genikoTotal)}) − Πληρωμές (€${fmt(incomeTotal)})): €${fmt(ypoloipo)}`}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footer}>
            * Το παρόν έγγραφο είναι εκτιμητικό και δεν αποτελεί τιμολόγιο ή απόδειξη πληρωμής. Τα ποσά είναι εκτιμητικά και θα επιβεβαιωθούν.
          </Text>
        </View>
        </View>
      </Page>
    </Document>
  );
}
