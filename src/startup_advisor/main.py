#!/usr/bin/env python
import sys
import warnings

import os
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

from startup_advisor.crew import StartupAdvisor  # noqa: E402




print("GROQ KEY:", os.getenv("GROQ_API_KEY"))
print("SERPER:", os.getenv("SERPER_API_KEY"))
def run():
    try:
        # 1. Trend Agent always runs
        print("Running Trend Agent...")
        StartupAdvisor().trend_crew().kickoff(inputs={})

        # 2. Business Discovery input

        field = input("Enter domain/field: ").strip()
        budget = input("Enter budget: ").strip()

        print("Running Business Discovery Agent...")
        business_result = StartupAdvisor().business_crew().kickoff(
            inputs={
                "field": field,
                "budget": budget
            }
        )



        print("Running Financial Agent...")
        financial_result = StartupAdvisor().financial_crew().kickoff(
            inputs={
                "business_report": str(business_result)
            }
        )

        print("Running Validation Agent...")
        validation_result = StartupAdvisor().validation_crew().kickoff(
            inputs={
                "financial_report": str(financial_result)
            }
        )

        print("Validation Completed!")
        print(validation_result)


    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")


def train():
    """
    Train the crew for a given number of iterations.
    """
    inputs = {
        "topic": "AI LLMs",
        'current_year': str(datetime.now().year)
    }
    try:
        StartupAdvisor().crew().train(n_iterations=int(sys.argv[1]), filename=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")

def replay():
    """
    Replay the crew execution from a specific task.
    """
    try:
        StartupAdvisor().crew().replay(task_id=sys.argv[1])

    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")

def test():
    """
    Test the crew execution and returns the results.
    """
    inputs = {
        "topic": "AI LLMs",
        "current_year": str(datetime.now().year)
    }

    try:
        StartupAdvisor().crew().test(n_iterations=int(sys.argv[1]), eval_llm=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while testing the crew: {e}")

def run_with_trigger():
    """
    Run the crew with trigger payload.
    """
    import json

    if len(sys.argv) < 2:
        raise Exception("No trigger payload provided. Please provide JSON payload as argument.")

    try:
        trigger_payload = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        raise Exception("Invalid JSON payload provided as argument")

    inputs = {
        "crewai_trigger_payload": trigger_payload,
        "topic": "",
        "current_year": ""
    }

    try:
        result = StartupAdvisor().crew().kickoff(inputs=inputs)
        return result
    except Exception as e:
        raise Exception(f"An error occurred while running the crew with trigger: {e}")

if __name__ == "__main__":
    run()
