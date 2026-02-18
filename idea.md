# Synapse - AI Study Planner

## Project Overview
A full-stack application that transforms static syllabi into interactive, dependency-aware study maps. It uses a Graph database to ensure students learn "A" before "B".

## Key Features
* **PDF Processing:** Backend extracts text from uploaded syllabus files.
* **LLM Integration:** Uses OpenAI to identify core concepts and their logical order.
* **Neo4j Knowledge Graph:** Visualizes the "map of learning" as a network of nodes.
* **Task Management:** A dashboard to mark topics as "Mastered," triggering updates in the roadmap.

## Tech Stack
* **Frontend:** React.js (Vite) + Tailwind CSS + Cytoscape.js (for graph visualization).
* **Backend:** Node.js + Express.js.
* **Databases:** * **PostgreSQL:** For user accounts and task status.
    * **Neo4j:** For the hierarchical relationship between study topics.
* **AI:** LangChain + OpenAI SDK.