import os
import sys

# Add src to python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from dotenv import load_dotenv
load_dotenv()

from startup_advisor.crew import StartupAdvisor

def test_all_agents():
    print("🚀 Triggering the Full Agent Pipeline...\n")

    try:
        # 1. Trend Agent
        print("--- 1. Running Trend Agent ---")
        trend_result = StartupAdvisor().trend_crew().kickoff(inputs={})
        print("Trend Output Saved to report.md\n")
        
        # 2. Business Discovery Agent
        print("--- 2. Running Business Discovery Agent ---")
        # Prompting the user for inputs
        field = input("Enter your industry/domain (e.g., AI Software): ").strip()
        budget = input("Enter your budget (e.g., $50,000): ").strip()
        
        business_result = StartupAdvisor().business_crew().kickoff(
            inputs={
                "field": field,
                "budget": budget
            }
        )
        print("Business Discovery Output Saved to business_report.md\n")
        
        # 3. Financial Agent
        print("--- 3. Running Financial Agent ---")
        financial_result = StartupAdvisor().financial_crew().kickoff(
            inputs={
                "business_report": str(business_result)
            }
        )
        print("Financial Analysis Output Saved to financial_report.md\n")
        
        # 4. Validation Agent
        print("--- 4. Running Validation Agent ---")
        validation_result = StartupAdvisor().validation_crew().kickoff(
            inputs={
                "financial_report": str(financial_result)
            }
        )
        print("\n=== FINAL VALIDATION OUTPUT ===")
        print(validation_result)
        print("===============================\n")
        
        print("✅ All agents executed successfully!")
        
    except Exception as e:
        print("❌ Error running agents:", e)

if __name__ == "__main__":
    test_all_agents()
