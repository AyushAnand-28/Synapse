# Synapse: AI-Powered Knowledge Graph & Adaptive Study Planner

## 1. Project Overview
**Synapse** is a specialized full-stack learning management tool that moves beyond linear scheduling. It treats a syllabus as a **Directed Acyclic Graph (DAG)**, where topics are nodes and prerequisites are edges. The system uses an adaptive algorithm to dynamically reschedule tasks based on real-time student performance and retention data.

---

## 2. Core Features (Scope)

### Intelligent Syllabus Parsing
* **Automated Extraction:** Users upload PDF/Text syllabi; the backend parses these into discrete "Topic Nodes."
* **Dependency Mapping:** The AI identifies prerequisite relationships (e.g., "You must understand *Linear Algebra* before *Neural Networks*").

### Knowledge Graph Visualization
* **Interactive Graph:** A visual representation of the curriculum where users can see the "critical path" to completing their course.
* **Topic Mastery:** Nodes change color/scale based on the `mastery_score` stored in the database.

### Dynamic Task Scheduling
* **Deadline-Aware Planning:** Generates a calendar based on the user's `target_date` and `daily_hour_commitment`.
* **Atomic Tasks:** Large topics are broken down into manageable study sessions.

### Adaptive Feedback Loop
* **Performance Tracking:** Users log quiz scores or study durations.
* **Auto-Rescheduling:** If a user fails a "Topic Node" or misses a deadline, the algorithm recalculates the entire downstream path in the graph.

---

## 3. Technical Architecture

### Backend
* **Architecture:** Layered Pattern (Controller -> Service -> Repository).
* **OOP Principles:** * **Encapsulation:** Protecting user progress logic within Service layers.
    * **Polymorphism:** Different "Scheduling Strategies" (e.g., *Speed Run* vs. *Deep Dive*).
* **Database:** * Relational (PostgreSQL) using an **Adjacency List** model for graph traversal.
    * Potential integration with **Neo4j** for complex relationship queries.

### Frontend
* **Technology:** React.js / Next.js.
* **Visualization:** `react-force-graph` or `D3.js` for the interactive Knowledge Graph.

---

## 4. Key Engineering Challenges
1. **Graph Traversal:** Implementing algorithms (like Topological Sort) to ensure topics are scheduled in the correct dependency order.
2. **Data Consistency:** Managing the state of the study plan when the "Adaptive Algorithm" triggers a bulk update on scheduled tasks.
3. **Parsing Accuracy:** Converting unstructured PDF data into structured JSON entities.

---

## 5. Success Metrics
* Successful generation of a non-linear study path from a raw text upload.
* Accurate recalculation of "Days to Completion" when a task status changes.
* Visual rendering of topic dependencies in a browser-based graph.
