
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import SerperDevTool
import os
from crewai import LLM

# LiteLLM requires OPENAI_API_KEY to be set when using the OpenAI provider format,
# even if we pass api_key directly. We trick it by setting it to our Groq key.
os.environ["OPENAI_API_KEY"] = os.environ.get("GROQ_API_KEY", "")

groq_llm = LLM(
    model="llama-3.3-70b-versatile",
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ.get("GROQ_API_KEY")
)

@CrewBase
class StartupAdvisor():

    @agent
    def trend_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config['trend_analyst'],
            tools=[SerperDevTool()],
            llm=groq_llm,
            verbose=True
        )
    # 🔥 Trend Task
    @task
    def trend_analysis_task(self) -> Task:
         return Task(
            config=self.tasks_config['trend_analysis_task'],
            agent=self.trend_analyst(),
            output_file="report.md"
        )
    
    @agent
    def business_discovery_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['business_discovery_agent'],
            llm=groq_llm,
            verbose=True
        )

    @task
    def business_discovery_task(self) -> Task:
        return Task(
            config=self.tasks_config['business_discovery_task'],
            agent=self.business_discovery_agent(),
            output_file="business_report.md"
       )
    
    @agent
    def financial_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['financial_agent'],
            tools=[SerperDevTool()],
            llm=groq_llm,
            verbose=True
    )

    @task
    def financial_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['financial_analysis_task'],
            agent=self.financial_agent(),
            output_file="financial_report.md"
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
    
    @crew
    def financial_crew(self) -> Crew:
        return Crew(
            agents=[self.financial_agent()],
            tasks=[self.financial_analysis_task()],
            process=Process.sequential
    )



    @agent
    def business_validation_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['business_validation_agent'],
            tools=[SerperDevTool()],
            llm=groq_llm,
            verbose=True
    )


    @task
    def business_validation_task(self) -> Task:
        return Task(
            config=self.tasks_config['validation_task'],
            agent=self.business_validation_agent(),
            output_file="validation_report.md"
    )


    @crew
    def validation_crew(self) -> Crew:
        return Crew(
            agents=[self.business_validation_agent()],
            tasks=[self.business_validation_task()],
            process=Process.sequential
        )

    @crew
    def crew(self) -> Crew:
        """Combined crew used by main.py default functions."""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential
        )
