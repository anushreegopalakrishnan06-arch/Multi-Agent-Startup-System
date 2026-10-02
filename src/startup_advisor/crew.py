# pyright: reportAttributeAccessIssue=none
# pyright: reportCallIssue=none
# pyright: reportArgumentType=none

import os
from typing import Any, Dict, List
from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import SerperDevTool

# LiteLLM requires OPENAI_API_KEY to be set when using the OpenAI provider
# format, even if we pass api_key directly. We trick it with our Groq key.
os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["OPENAI_API_KEY"] = os.environ.get("GROQ_API_KEY", "")

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUTPUTS_DIR = os.path.join(ROOT_DIR, "outputs")
os.makedirs(OUTPUTS_DIR, exist_ok=True)

groq_llm = LLM(
    model="openai/gpt-oss-120b",
    provider="openai",
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ.get("GROQ_API_KEY")
)


@CrewBase
class StartupAdvisor():
    agents_config: Dict[str, Any]
    tasks_config: Dict[str, Any]
    agents: List[Agent]
    tasks: List[Task]

    @agent
    def trend_analyst(self) -> Agent:
        return Agent(  # type: ignore[call-arg]
            config=self.agents_config['trend_analyst'],
            tools=[SerperDevTool()],
            llm=groq_llm,
            verbose=True
        )

    # Trend Task
    @task
    def trend_analysis_task(self) -> Task:
        return Task(  # type: ignore[call-arg]
            config=self.tasks_config['trend_analysis_task'],
            agent=self.trend_analyst(),
            output_file=os.path.join(OUTPUTS_DIR, "report.md")
        )

    @agent
    def business_discovery_agent(self) -> Agent:
        return Agent(  # type: ignore[call-arg]
            config=self.agents_config['business_discovery_agent'],
            llm=groq_llm,
            verbose=True
        )

    @task
    def business_discovery_task(self) -> Task:
        return Task(  # type: ignore[call-arg]
            config=self.tasks_config['business_discovery_task'],
            agent=self.business_discovery_agent(),
            output_file=os.path.join(OUTPUTS_DIR, "business_report.md")
        )

    @agent
    def financial_agent(self) -> Agent:
        return Agent(  # type: ignore[call-arg]
            config=self.agents_config['financial_agent'],
            tools=[SerperDevTool()],
            llm=groq_llm,
            verbose=True
        )

    @task
    def financial_analysis_task(self) -> Task:
        return Task(  # type: ignore[call-arg]
            config=self.tasks_config['financial_analysis_task'],
            agent=self.financial_agent(),
            output_file=os.path.join(OUTPUTS_DIR, "financial_report.md")
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
        return Agent(  # type: ignore[call-arg]
            config=self.agents_config['business_validation_agent'],
            tools=[SerperDevTool()],
            llm=groq_llm,
            verbose=True
        )

    @task
    def business_validation_task(self) -> Task:
        return Task(  # type: ignore[call-arg]
            config=self.tasks_config['validation_task'],
            agent=self.business_validation_agent(),
            output_file=os.path.join(OUTPUTS_DIR, "validation_report.md")
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
