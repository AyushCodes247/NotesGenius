# NoteGenius — Capacity Modeling

- **Document:** `docs/capacity-modeling.md`
- **Version:** 1.0
- **Status:** Draft for engineering review
- **Modeling horizon:** Six months, represented as 180 days
- **Purpose:** Estimate application traffic and logical data volume, document every input and calculation, and identify missing information before infrastructure sizing.

---

## 1. Purpose and Scope

This document establishes the initial capacity model for NoteGenius, an AI-powered notes generator and summarizer.

The model covers:

1. User population and workload assumptions.
2. Ordinary API request volume and peak traffic.
3. Read/write traffic distribution.
4. AI note-generation volume.
5. Preliminary database operation estimates.
6. PostgreSQL logical data volume.
7. Uploaded-file and generated-export storage.
8. Six-month cumulative volume.
9. Limitations, unverified inputs, and information required for physical capacity planning.

This document does **not** claim that the estimates are production measurements, benchmark results, or validated infrastructure requirements.

### 1.1 Modeling principles

- Every numerical input must have a stated source or an explicit provisional status.
- Calculations must be reproducible from documented formulas.
- Unknown values must remain unresolved rather than being silently filled in.
- Derived results must be distinguished from assumed inputs.
- Logical data volume must not be confused with allocated disk capacity.
- Traffic rate must not be confused with concurrent requests.
- Infrastructure sizing must wait until the necessary workload and operational requirements are available.

---

## 2. Input Classification

The following classifications apply throughout this document.

| Classification | Meaning |
|---|---|
| Specified | Explicitly supplied by the project owner or established as a project requirement. |
| Provisional | An illustrative input introduced during planning that has not been validated. |
| Derived | A result calculated from other documented inputs. |
| Unresolved | Information is missing; no definitive value can be calculated without further input. |

A provisional input may be used for scenario analysis, but it must not be presented as a confirmed requirement.

---

## 3. Baseline Inputs

### 3.1 User and workload inputs

| Input | Value | Classification | Source or explanation |
|---|---:|---|---|
| Registered users | 100,000 | Specified for planning | Project owner's selected baseline |
| Daily active users (DAU) | 10,000 | Specified for planning | Project owner's selected baseline |
| Planning horizon | 6 months | Specified for planning | Project owner's selected baseline |
| Modeling duration | 180 days | Modeling convention | Six months approximated as 180 days |
| Ordinary API requests per DAU per day | 40 | Specified for planning | Project owner's selected baseline |
| Ordinary traffic peak factor | 5× | Specified for planning | Project owner's selected baseline |
| Read share | 80% | Specified for planning | Project owner's selected baseline |
| Write share | 20% | Specified for planning | Project owner's selected baseline |
| AI note generations per DAU per day | 1 | Specified for planning | Project owner's selected baseline |
| Busiest-two-hour concentration factor | 2× | Specified for planning | Project owner's selected baseline |
| Maximum uploaded-file size | 4 MB | Project requirement | Previously established upload limit |
| Ordinary read/write latency target | 400 ms end-to-end | Project target | Detailed workload and measurement criteria remain to be finalized |

The 180-day convention is an approximation. Six calendar months can contain a different number of days depending on the start and end dates.

The 100,000 registered users and 10,000 DAU figures describe the selected planning scenario. They do not establish how quickly users will be acquired.

### 3.2 Provisional data-volume inputs

The following values were used in the previous data-volume calculations. They have not yet been validated against an implemented application or measured data.

| Input | Value | Classification |
|---|---:|---|
| Average user-record size | 2 KB/user | Provisional |
| Average saved-note size | 20 KB/note | Specified as a modeling choice; actual size unmeasured |
| Saved-note rate | 80% of AI generations | Specified for planning |
| Average quiz size | 15 KB/quiz | Provisional |
| Quiz generations per DAU per day | 0.2 | Provisional |
| Average upload size | 1 MB/file | Specified as a modeling choice; actual size unmeasured |
| Upload frequency | One upload per DAU every 3 days | Specified for planning |
| Average generated-export size | 500 KB/export | Provisional |
| Export requests per 100 DAU per day | 20 | Specified for planning |
| Upload retention | Retained throughout the modeled period | Provisional modeling policy |
| Export retention | Retained until deleted | Specified for planning |
| Note retention | Until deleted | Proposed policy; needs confirmation |
| Quiz retention | Throughout the modeled period | Provisional modeling policy |

> **Important:** Selecting an average size for a calculation does not establish that the actual average will match it. These values must eventually be checked against representative generated content and uploaded files.

### 3.3 Provisional database-workload input

An earlier estimate used 1.5–3 logical database operations per ordinary API request.

This is an **unvalidated illustrative range**, not an established application property. It is retained below only to show how the preliminary database workload was calculated.

---

## 4. Traffic Modeling

### 4.1 Ordinary API request volume

**Formula:**

$$R_{\text{daily}} = DAU \times r$$

Where:

- $DAU$ = daily active users.
- $r$ = ordinary API requests per active user per day.

Substituting the selected values:

$$R_{\text{daily}} = 10{,}000 \times 40 = 400{,}000$$

**Result:** the modeled ordinary API workload is **400,000 requests per day**.

### 4.2 Average requests per second

**Formula** (the denominator is the number of seconds in a 24-hour day):

$$R_{\text{avg}} = \frac{R_{\text{daily}}}{86{,}400}$$

$$R_{\text{avg}} = \frac{400{,}000}{86{,}400} \approx 4.63 \text{ RPS}$$

**Result:** approximately **4.63 RPS**. This is a 24-hour average. It does not describe the instantaneous rate during bursts.

### 4.3 Estimated peak requests per second

The selected peak factor is 5×.

**Formula:**

$$R_{\text{peak}} = R_{\text{avg}} \times P, \quad P = 5$$

$$R_{\text{peak}} = 4.6296 \times 5 \approx 23.15 \text{ RPS}$$

**Result:** approximately **23.15 RPS**, or about **24 ordinary API requests per second** when rounded upward for planning.

This is a mathematical result from the selected peak factor, not a measured or validated service capacity.

### 4.4 Read/write request distribution

The selected request mix is 80% reads and 20% writes.

**Daily reads:**

$$R_{\text{read}} = 400{,}000 \times 0.80 = 320{,}000 \text{ per day}$$

**Daily writes:**

$$R_{\text{write}} = 400{,}000 \times 0.20 = 80{,}000 \text{ per day}$$

**Average read rate:**

$$\frac{320{,}000}{86{,}400} \approx 3.70 \text{ RPS}$$

**Average write rate:**

$$\frac{80{,}000}{86{,}400} \approx 0.93 \text{ RPS}$$

If the 5× factor applies equally to both categories:

| Metric | Reads | Writes | Total |
|---|---:|---:|---:|
| Requests/day | 320,000 | 80,000 | 400,000 |
| Average RPS | 3.70 | 0.93 | 4.63 |
| Estimated peak RPS | 18.52 | 4.63 | 23.15 |

The equal application of the peak factor to reads and writes is a modeling assumption. The actual read/write distribution during peak periods remains unmeasured.

### 4.5 Busiest-two-hour concentration

The selected concentration factor is 2× the uniform two-hour activity average.

The duration of the reference activity window has not been specified. Therefore, the busiest-two-hour request count cannot be uniquely calculated from the supplied inputs alone.

Let:

- $H$ = number of hours in the reference activity window.
- $D = 400{,}000$ = daily ordinary requests.
- $C = 2$ = concentration factor.

If activity is assumed to be uniform within the reference window, and the busiest two hours receive $C$ times the uniform two-hour average, then:

$$R_{\text{busy-2h}} = \frac{D}{H} \times 2 \times C$$

Here, the first $2$ is the window duration in hours, and $C$ is the concentration factor. Thus:

$$R_{\text{busy-2h}} = \frac{400{,}000}{H} \times 2 \times 2$$

The value of $H$ is unresolved, so no single result is recorded as the baseline.

**Relationship to the 5× peak factor:** The two factors describe different things:

- The 5× factor estimates a short-term peak relative to the 24-hour average.
- The 2× concentration factor describes the average activity in the busiest two hours relative to a uniform two-hour average over a reference window.

They must not be multiplied together automatically. The peak factor's measurement interval and the concentration factor's reference window must be defined before validating the combined traffic model.

### 4.6 Six-month ordinary API volume

Under constant daily usage for 180 days:

$$R_{\text{180d}} = 400{,}000 \times 180 = 72{,}000{,}000$$

**Result:** **72 million ordinary API requests over 180 days.**

This does not model gradual adoption, seasonal peaks, retries, automated traffic, or changes in per-user behavior.

---

## 5. AI Note-Generation Workload

### 5.1 Daily generation count

The selected workload is one AI note generation per DAU per day.

$$G_{\text{daily}} = 10{,}000 \times 1 = 10{,}000 \text{ generations per day}$$

### 5.2 Average job arrival rate

$$G_{\text{avg}} = \frac{10{,}000}{86{,}400} \approx 0.116 \text{ jobs per second}$$

### 5.3 Six-month generation count

$$G_{\text{180d}} = 10{,}000 \times 180 = 1{,}800{,}000 \text{ generations}$$

### 5.4 Saved-note count

The selected saved-note rate is 80%.

$$N_{\text{saved/day}} = 10{,}000 \times 0.80 = 8{,}000$$

Over 180 days:

$$N_{\text{saved/180d}} = 8{,}000 \times 180 = 1{,}440{,}000$$

This assumes the saved-note rate applies consistently to daily generation volume and that each saved result contributes one new retained note. Updating existing notes, deleting notes, and saving multiple versions are not modeled.

### 5.5 AI capacity limitations

Generation arrival rate is not the same as concurrent generation count.

The following inputs are unresolved:

- Average and percentile AI request duration.
- Input and output token counts.
- Provider rate limits and token-throughput limits.
- Retry behavior and retry volume.
- Failure rate and regeneration behavior.
- Whether generation is synchronous or asynchronous.
- Whether every generation creates a new note or updates an existing one.

Consequently, this document does not calculate AI concurrency, token consumption, provider cost, or required worker count.

---

## 6. Preliminary Database Workload

An earlier planning estimate used 1.5–3 logical database operations per ordinary API request.

This range is unvalidated and must be replaced by measurements or query analysis once API endpoints and database access patterns are defined.

### 6.1 Daily logical database operations

Lower estimate:

$$400{,}000 \times 1.5 = 600{,}000$$

Upper estimate:

$$400{,}000 \times 3 = 1{,}200{,}000$$

**Preliminary range:** **600,000–1,200,000 operations/day.**

### 6.2 Average operation rate

$$\frac{600{,}000}{86{,}400} \approx 6.94 \qquad \frac{1{,}200{,}000}{86{,}400} \approx 13.89$$

**Preliminary average:** **6.94–13.89 logical operations/second.**

If the same 5× factor applies: **34.72–69.44 logical operations/second at peak.**

These are not physical disk IOPS, SQL statement counts, or validated PostgreSQL throughput. A single statement can access multiple rows and pages, while one HTTP request can trigger multiple statements.

This estimate also excludes database operations caused by AI jobs, exports, session management, background processing, and retries.

---

## 7. Storage Unit Convention

For the calculations in this document, decimal units are used:

- 1 KB = 1,000 bytes
- 1 MB = 1,000 KB
- 1 GB = 1,000 MB
- 1 TB = 1,000 GB

This convention makes the arithmetic reproducible. Actual storage tools may report binary units such as KiB, MiB, and GiB, so reported values may differ.

---

## 8. PostgreSQL Logical Data Volume

The following estimates cover only the data categories explicitly modeled here. They do not represent complete database disk allocation.

### 8.1 User records

**Provisional input:** 2 KB per registered user.

$$V_{\text{users}} = 100{,}000 \times 2 \text{ KB} = 200{,}000 \text{ KB} = 0.2 \text{ GB}$$

This assumes the 2 KB estimate represents the average logical user record. It is not a measured row size and does not include all authentication, session, audit, or relationship tables.

### 8.2 Saved-note content

From Section 5, the model produces 1,440,000 saved notes over 180 days.

**Input:** 20 KB average saved-note content size.

$$V_{\text{notes}} = 1{,}440{,}000 \times 20 \text{ KB} = 28{,}800{,}000 \text{ KB} = 28.8 \text{ GB}$$

This assumes the 20 KB estimate represents the average stored note content. It does not include separately stored source documents, database indexes, row overhead, revisions, or other metadata unless those are included in the chosen average.

### 8.3 Quiz data

**Provisional inputs:**

- 0.2 quizzes per DAU per day.
- 15 KB per quiz, including questions and answer metadata.

Daily quiz count:

$$Q_{\text{daily}} = 10{,}000 \times 0.2 = 2{,}000$$

Six-month quiz count:

$$Q_{\text{180d}} = 2{,}000 \times 180 = 360{,}000$$

Logical quiz volume:

$$V_{\text{quizzes}} = 360{,}000 \times 15 \text{ KB} = 5.4 \text{ GB}$$

This assumes each generated quiz is saved and retained throughout the modeled period. Quiz attempts, individual answer history, score history, and repeated quiz versions are excluded.

### 8.4 Modeled PostgreSQL subtotal

| Data category | Calculation | Logical volume |
|---|---|---:|
| User records | 100,000 × 2 KB | 0.2 GB |
| Saved notes | 1,440,000 × 20 KB | 28.8 GB |
| Quiz data | 360,000 × 15 KB | 5.4 GB |
| **Subtotal** | Sum of the modeled categories | **34.4 GB** |

$$V_{\text{PG,modeled}} = 0.2 + 28.8 + 5.4 = 34.4 \text{ GB}$$

This is a logical data subtotal, not a final PostgreSQL disk requirement.

The following database categories remain unmodeled:

- Note metadata and source-document metadata.
- Sharing and authorization relationships.
- Quiz attempts and detailed answer history.
- Authentication-related records.
- Indexes and constraints.
- PostgreSQL row, page, and storage overhead.
- Updates, deletes, dead tuples, and vacuum-related free space.
- Migrations and operational metadata.
- Replicas, backups, and recovery copies.

---

## 9. Object Storage Volume

### 9.1 Uploaded files

**Specified modeling inputs:**

- 10,000 DAU.
- One upload per DAU every three days.
- Average upload size of 1 MB.
- 180-day horizon.

The average daily upload count is:

$$U_{\text{daily}} = \frac{10{,}000}{3} \approx 3{,}333.33$$

The fractional result represents an average rate, not a fraction of a physical file.

Six-month upload count:

$$U_{\text{180d}} = \frac{10{,}000}{3} \times 180 = 600{,}000 \text{ files}$$

Logical upload volume:

$$V_{\text{uploads}} = 600{,}000 \times 1 \text{ MB} = 600 \text{ GB}$$

This assumes each upload is unique, retained for the modeled period, and not deduplicated or deleted.

#### Maximum-size boundary

The upload limit is 4 MB per file. If all 600,000 files were exactly 4 MB:

$$600{,}000 \times 4 \text{ MB} = 2{,}400{,}000 \text{ MB} = 2.4 \text{ TB}$$

This is a boundary scenario, not the baseline estimate. It does not account for object-storage metadata or replication.

### 9.2 Generated exports

**Inputs:**

- 20 export requests per 100 DAU per day.
- 10,000 DAU.
- 500 KB average export size, provisionally carried forward from the previous model.
- Exports retained until deleted.

Daily export requests:

$$E_{\text{daily}} = \frac{20}{100} \times 10{,}000 = 2{,}000$$

Six-month export count:

$$E_{\text{180d}} = 2{,}000 \times 180 = 360{,}000$$

Logical export volume:

$$V_{\text{exports}} = 360{,}000 \times 500 \text{ KB} = 180 \text{ GB}$$

This assumes every export request creates one unique stored file and every file remains stored. Export regeneration, duplicate reuse, deletion, compression, and temporary-file cleanup are not modeled.

The average export size is unvalidated. PDF and PNG exports may have materially different size distributions.

### 9.3 Modeled object-storage subtotal

| Category | Calculation | Logical volume |
|---|---|---:|
| Uploaded files | 600,000 × 1 MB | 600 GB |
| Generated exports | 360,000 × 500 KB | 180 GB |
| **Subtotal** | Sum of modeled file categories | **780 GB** |

$$V_{\text{object}} = 600 + 180 = 780 \text{ GB}$$

This estimate assumes the uploads and exports remain retained throughout the horizon and does not include additional object versions, replicas, or backup copies.

---

## 10. Combined Modeled Logical Data Volume

| Storage system | Included categories | Estimated logical volume |
|---|---|---:|
| PostgreSQL | Users, saved notes, quizzes | 34.4 GB |
| Object storage | Uploaded files, generated exports | 780 GB |
| **Combined modeled total** | All categories listed above | **814.4 GB** |

$$V_{\text{combined}} = 34.4 + 780 = 814.4 \text{ GB}$$

This figure is the sum of the modeled logical content categories. It is **not** a complete estimate of physical capacity required to operate NoteGenius.

It excludes database indexes and storage overhead, unmodeled relational data, Redis, logs, temporary files, backups, replicas, and operational headroom.

The model indicates that uploaded files and generated exports are the largest of the currently modeled storage categories.

---

## 11. Six-Month Constant-Usage Scenario

The calculations above assume the selected DAU and usage rates remain constant for 180 days.

Under that scenario:

| Metric | Six-month result |
|---|---:|
| Ordinary API requests | 72,000,000 |
| AI note generations | 1,800,000 |
| Saved notes | 1,440,000 |
| Quiz generations | 360,000 |
| Uploaded files | 600,000 |
| Generated exports | 360,000 |
| Modeled PostgreSQL logical data | 34.4 GB |
| Modeled object-storage logical data | 780 GB |
| Combined modeled logical data | 814.4 GB |

These are cumulative totals under the constant-usage scenario. They are not an adoption forecast.

A growth forecast requires an explicit user-acquisition or DAU-growth model. No such growth rate has been specified, so none is applied here.

The model also assumes retained records accumulate without deletions. Actual storage growth will differ if users delete notes, uploads, quizzes, or exports.

---

## 12. What This Model Does Not Establish

The estimates in this document do not establish:

1. The appropriate PostgreSQL instance size.
2. The number or size of application instances.
3. Database connection-pool limits.
4. Required worker count or AI-generation concurrency.
5. Actual achievable RPS or latency.
6. AI provider costs or token throughput.
7. Physical disk allocation or object-storage billing.
8. Backup and disaster-recovery capacity.
9. Redis memory requirements.
10. A validated six-month user-growth forecast.

These require additional workload definitions, schema and query design, operational requirements, provider constraints, or measurements.

---

## 13. Unresolved Inputs and Required Follow-Up

The following information is still required before final infrastructure sizing.

### 13.1 Traffic and concurrency

- Definition and measurement interval for the 5× peak factor.
- Reference activity window for the busiest-two-hour concentration.
- Actual read/write mix during peak periods.
- Request-duration distribution and concurrent in-flight requests.
- Retry rates and automated traffic volume.
- Expected adoption and DAU growth over six months.

### 13.2 AI processing

- AI provider and model.
- Average and percentile input/output token counts.
- Average and percentile generation duration.
- Provider rate and token-throughput limits.
- Retry and failure rates.
- Synchronous versus asynchronous generation behavior.
- Whether generated results are always new notes or may update existing notes.

### 13.3 Database and relational data

- Final schema and column types.
- Actual stored-note size distribution.
- User and note metadata requirements.
- Sharing relationship counts.
- Quiz-attempt and answer-history persistence requirements.
- Index definitions and expected query patterns.
- Update/delete behavior and database maintenance overhead.

### 13.4 Object storage and retention

- Actual upload-size distribution by file type.
- Whether source uploads are retained after processing.
- Duplicate upload and deduplication behavior.
- Actual PDF and PNG export sizes.
- Whether repeated exports create new files or reuse existing ones.
- Deletion and retention policies.
- Object versioning, replication, and backup requirements.
- Temporary-file lifetime and cleanup behavior.

### 13.5 Operational capacity

- Backup retention period.
- Recovery point objective (RPO).
- Recovery time objective (RTO).
- Availability target.
- Replica and failover strategy.
- Database and object-storage headroom requirements.
- Redis session and cache sizing inputs.
- Log retention and observability requirements.

No values are assigned to these unresolved items in this document.

---

## 14. Validation Plan

The capacity model should be revised when implementation and representative measurements become available.

1. **Validate traffic:** Measure request counts and latency by endpoint and operation type.
2. **Validate query workload:** Map API operations to actual SQL statements and measure database load.
3. **Validate record sizes:** Measure representative PostgreSQL rows and indexes.
4. **Validate note sizes:** Measure generated note content across representative input documents.
5. **Validate file sizes:** Measure upload and export sizes by supported format.
6. **Validate retention:** Confirm which source files, generated notes, quizzes, and exports persist.
7. **Validate AI capacity:** Measure generation duration, token usage, failure rates, and provider limits.
8. **Run load tests:** Test the specified workload, peak duration, concurrency, and latency criteria.
9. **Recalculate capacity:** Update all formulas using observed values and explicitly revised assumptions.

Until these steps are completed, the outputs should be treated as planning estimates.

---

## 15. Summary

The current model uses a six-month, constant-usage scenario with 100,000 registered users and 10,000 DAU.

Its principal results are:

- **Ordinary API traffic:** 400,000 requests/day.
- **Average ordinary API rate:** approximately 4.63 RPS.
- **Estimated ordinary peak:** approximately 23.15 RPS using the selected 5× factor.
- **AI note generations:** 10,000/day.
- **Modeled PostgreSQL logical data:** 34.4 GB.
- **Modeled object-storage logical data:** 780 GB.
- **Combined modeled logical data:** 814.4 GB.

The storage totals depend on several unvalidated average-size and retention assumptions. The traffic estimates depend on a simplified usage model. Neither should be used as a final infrastructure or cost commitment without validation.

**Next step:** Finalize the missing workload definitions and retention rules, then extend this model to physical storage, indexes, backups, Redis, concurrency, and infrastructure sizing.

---

**End of capacity modeling document**
