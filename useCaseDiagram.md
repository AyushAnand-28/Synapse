usecaseDiagram
actor Student
actor Admin
actor System

Student --> (Upload syllabus)
Student --> (View study roadmap)
Student --> (Mark tasks complete)
Student --> (Take assessments)
Student --> (View analytics)

Admin --> (Manage subjects)
Admin --> (Update difficulty metadata)

System --> (Generate dependency graph)
System --> (Create study plan)
System --> (Send reminders)
System --> (Adapt schedule)
