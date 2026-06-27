import os
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task


@CrewBase
class StartupAdvisor():

    # 🔥 Trend Agent
    @agent
    def trend_analyst(self) -> Agent:
        return Agent(
            role="Startup Trend Analyst",
            goal="Analyze startup trends",
            backstory="Expert in market research and startup ecosystem",
            llm="gemini/gemini-2.5-flash",
            verbose=True
        )

    # 🔥 Trend Task
    @task
    def trend_analysis_task(self) -> Task:
        return Task(
            description="""
            Analyze the latest trends related to the startup idea: {startup_idea}.

            Focus on:
            1. Current market trends
            2. Emerging technologies
            3. Customer demand
            4. Industry growth opportunities
            5. Potential risks
            """,
            expected_output="""
            A detailed trend analysis report with trends, opportunities, risks
            """,
            agent=self.trend_analyst(),
            output_file="report.md"
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=[self.trend_analyst()],
            tasks=[self.trend_analysis_task()],
            process=Process.sequential,
            verbose=True
        )
    