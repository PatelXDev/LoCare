# LoCare

> **Development of a Medical Emergency & Discovery System Based on Informal Local Landmarks**  
> *MedTech & Healthcare Platform for Tier-2 / Tier-3 Cities*

---

## 📌 Problem Statement
In unfamiliar cities and semi-urban areas, travelers and locals face critical delays when searching for emergency medical assistance. Traditional map platforms rely strictly on postal codes, street addresses, and door numbers—failing to group medical facilities around informal local landmarks (e.g., local *chowks* or community spots). Additionally, generic platforms lack direct integration with essential emergency response hotlines like the 108 helpline.

---

## 💡 Solution
**LoCare** bridges this gap by offering a lightweight, zero-cost web application designed for low-end smartphones. It allows users to search for emergency facilities using natural symptoms and local informal landmarks, providing 1-tap SOS triggers that instantly connect to official helplines.

---

## ✨ Key Features
* **Informal Landmark & Symptom Search:** Maps everyday landmarks directly to nearby specialized clinics based on patient symptoms.
* **Instant 1-Tap SOS Trigger:** Bypasses manual dialing by instantly routing verified emergency numbers (e.g., 108, Police) straight to the phone's native dialer.
* **Zero-Cost Map Engine:** Utilizes open-source vector tiles to eliminate per-query API billing costs.
* **Low-Hardware Optimization:** Lightweight client-side rendering optimized for basic smartphones and poor network coverage.
* **Crowdsourced Landmark Validation:** Allows local community members to tag and verify informal landmarks.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) | Zero-dependency, lightweight client-side UI for fast loading. |
| **Mapping Engine** | LeafletJS & OpenStreetMap (OSM) | Renders custom pins, proximity circles, and interactive map popups. |
| **External API** |Photon Api ,Overpass Api , OSRMA  |  symptom-to-specialty mapping, and routing logic. |


---

## 📐 System Architecture

```text
+-----------------------------------------------------------------------+
|                       CLIENT LAYER (Browser / Device)                 |
|                                                                       |
|  +-----------------------------+       +---------------------------+  |
|  |     User Interface          |       |      Mapping Engine       |  |
|  |    (HTML5, CSS3, JS)        | <---> |       (LeafletJS)         |  |
|  +-----------------------------+       +---------------------------+  |
+-----------------------------------------------------------------------+
           |                ^                            ^
HTTP / REST|                | JSON Data                  | Tile Fetch
(Requests) |                |                            |
           v                |                            |
+---------------------------------------+      +------------------------+
|          APPLICATION LAYER            |      |   EXTERNAL SERVICE     |
|       (Node.js & Express.js)          |      |    OpenStreetMap       |
+---------------------------------------+      +------------------------+
           |                ^
Spatial SQL|                | Verified Data
 Queries   |                |
           v                |
+-----------------------------------------------------------------------+
|                           DATA LAYER                                  |
|        PostgreSQL (Relational) + PostGIS (Spatial Engine)             |
+-----------------------------------------------------------------------+
