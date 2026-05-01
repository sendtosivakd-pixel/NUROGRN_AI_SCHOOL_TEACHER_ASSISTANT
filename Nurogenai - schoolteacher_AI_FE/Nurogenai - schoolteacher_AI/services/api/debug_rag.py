from app.db.session import SessionLocal
from app.services.textbook_service import TextbookService
from app.services.rag_service import CurriculumRAGService
from app.schemas.textbook import TeacherAssistantRequest

def debug_search():
    db = SessionLocal()
    textbook_service = TextbookService(db)
    rag_service = CurriculumRAGService(textbook_service)
    
    # Test 1: Broad search for English
    req = TeacherAssistantRequest(
        query="English",
        standard=1,
        medium="English",
        subject="English",
        limit=5
    )
    
    print("--- SEARCH RESULTS ---")
    results = textbook_service.search(req)
    print(f"Total results found: {len(results.results)}")
    for i, res in enumerate(results.results):
        print(f"[{i}] Score: {res.score} | Book: {res.textbook.title} | Content: {res.chunk.content[:100]}...")

    print("\n--- RAG ANSWER ---")
    ans = rag_service.answer(req)
    print(f"RAG Answer: {ans.answer}")

if __name__ == "__main__":
    debug_search()
