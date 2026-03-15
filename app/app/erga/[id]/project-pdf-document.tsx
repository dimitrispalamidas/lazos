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
};

export function ProjectPdfDocument({ project, logoSrc }: ProjectPdfDocumentProps) {
  const incomeTotal = (project.project_income ?? []).reduce(
    (sum, r) => sum + rowTotal(r.amount, r.vat_percent),
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
  const ypoloipo = targetTotal - incomeTotal;
  const fmt = (n: number) =>
    n.toLocaleString("el-GR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Έργο: {project.customer_name}</Text>
          {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : <View />}
        </View>

        {/* 1. Εργασίες: 3 τυπικές τιμές, άλλες εργασίες, γενικό (όπως στο UI) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Εργασίες</Text>
          {(project.price_per_meter != null && Number(project.price_per_meter) !== 0) || (project.price_metra != null && Number(project.price_metra) !== 0) ? (
            <View style={styles.row}>
              <Text style={styles.label}>Μετρο</Text>
              <Text style={styles.value}>
                {fmt(Number(project.price_per_meter))}
                {project.price_metra != null && Number(project.price_metra) !== 0
                  ? ` · Μετρα: ${fmt(Number(project.price_metra))} → Σύνολο: €${fmt(Number(project.price_per_meter) * Number(project.price_metra))}`
                  : ""}
              </Text>
            </View>
          ) : null}
          {project.sinazi != null && project.sinazi !== "" ? (
            <View style={styles.row}>
              <Text style={styles.label}>Σιναζί</Text>
              <Text style={styles.value}>
                {project.sinazi}
                {project.sinazi_metro != null && Number(project.sinazi_metro) !== 0
                  ? ` · Μετρα: ${fmt(Number(project.sinazi_metro))} → Σύνολο: €${fmt(Number(project.sinazi) * Number(project.sinazi_metro))}`
                  : ""}
              </Text>
            </View>
          ) : null}
          {project.gonies != null && project.gonies !== "" ? (
            <View style={styles.row}>
              <Text style={styles.label}>Γωνίες</Text>
              <Text style={styles.value}>
                {project.gonies}
                {project.gonies_metro != null && Number(project.gonies_metro) !== 0
                  ? ` · Μετρα: ${fmt(Number(project.gonies_metro))} → Σύνολο: €${fmt(Number(project.gonies) * Number(project.gonies_metro))}`
                  : ""}
              </Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.label}>Μερικό Σύνολο (€)</Text>
            <Text style={styles.value}>
              {fmt(merikoTotal)}
              {merikoTotalWithVat != null ? ` (με ΦΠΑ: €${fmt(merikoTotalWithVat)})` : ""}
            </Text>
          </View>

          {(project.project_other_works ?? []).length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 12, fontSize: 11 }]}>Άλλες εργασίες</Text>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCol1}>Όνομα</Text>
                <Text style={styles.tableCol3}>Τιμή (€)</Text>
              </View>
              {(project.project_other_works ?? []).map((r, i) => (
                <View key={r.id ?? i} style={styles.tableRow}>
                  <Text style={styles.tableCol1}>{r.name}</Text>
                  <Text style={styles.tableCol3}>{fmt(r.price)}</Text>
                </View>
              ))}
              <Text style={styles.total}>
                Σύνολο άλλων εργασιών: €{fmt(otherWorksTotal)}
              </Text>
            </>
          )}

          <View style={[styles.row, { marginTop: 8 }]}>
            <Text style={styles.label}>Γενικό Σύνολο (€)</Text>
            <Text style={styles.value}>
              {fmt(genikoTotal)}
              {genikoTotalWithVat != null ? ` (με ΦΠΑ: €${fmt(genikoTotalWithVat)})` : ""}
            </Text>
          </View>
        </View>

        {/* 2. Πληρωμές και υπόλοιπο */}
        {(project.project_income ?? []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Πληρωμές</Text>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCol1}>Ποσό (€)</Text>
              <Text style={styles.tableCol2}>ΦΠΑ %</Text>
              <Text style={styles.tableCol3}>Σύνολο (€)</Text>
            </View>
            {(project.project_income ?? []).map((r, i) => (
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
            <Text style={styles.total}>Σύνολο πληρωμών: €{fmt(incomeTotal)}</Text>
            <Text style={[styles.total, { marginTop: 8 }]}>
              Υπόλοιπο ({genikoTotalWithVat != null ? "Γενικό με ΦΠΑ" : "Γενικό"} − Πληρωμές): €{fmt(ypoloipo)}
            </Text>
          </View>
        )}

        {(project.project_income ?? []).length === 0 && (
          <View style={styles.section}>
            <Text style={styles.total}>
              Υπόλοιπο ({genikoTotalWithVat != null ? "Γενικό με ΦΠΑ" : "Γενικό"} − Πληρωμές): €{fmt(ypoloipo)}
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
