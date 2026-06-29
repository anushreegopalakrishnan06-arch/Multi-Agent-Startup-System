import os
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import SerperDevTool

search_tool = SerperDevTool()


@CrewBase
class StartupAdvisor():

    @agent
    def trend_analyst(self) -> Agent:
        return Agent(
            role="Market Trend Analyst",
            goal="""
            Search the current market and identify trending domains,
            trending jobs, emerging technologies, customer demand,
            and business opportunities.
            """,
            backstory="""
            Expert in market research and technology trends.
             Continuously analyzes global markets and recommends
            high-demand industries and business opportunities.
            """,
            tools=[search_tool],
            llm="gemini/gemini-2.5-flash",
            verbose=True
        )
    # 🔥 Trend Task
    @task
    def trend_analysis_task(self) -> Task:
         return Task(
            description="""
            Search the current market and identify:

            1. Top trending domains
            2. Trending jobs and career opportunities
            3. Emerging technologies
            4. Customer demand
            5. Industry growth opportunities
            6. Recommended business and startup ideas

            Use the latest information from the web.
            """,
            expected_output="""
            A detailed report containing:
            - Trending Domains
            - Trending Jobs
            - Emerging Technologies
            - Customer Demand
            - Industry Growth Opportunities
            - Business Recommendations
            """,
            agent=self.trend_analyst(),
            output_file="report.md"
        )
    
    @agent
    def business_discovery_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['business_discovery_agent'],
            llm="gemini/gemini-2.5-flash",
            verbose=True
        )

    @task
    def business_discovery_task(self) -> Task:
        return Task(
            config=self.tasks_config['business_discovery_task'],
            agent=self.business_discovery_agent(),
            output_file="business_report.md"
       )

    @crew
    def trend_crew(self) -> Crew:
        return Crew(
            agents=[self.trend_analyst()],
            tasks=[self.trend_analysis_task()],
            process=Process.sequential
        )

    @crew
    def business_crew(self) -> Crew:
        return Crew(
            agents=[self.business_discovery_agent()],
            tasks=[self.business_discovery_task()],
            process=Process.sequential
       )

 