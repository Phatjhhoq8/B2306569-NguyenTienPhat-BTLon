# Multi-Agent Library Assistant - 3 Layers

```mermaid
flowchart TD
    U[User] --> FE[Frontend Chat Widget]
    FE --> API[Agent API /api/chat]

    subgraph L3["Tang 3 - Orchestrator / Dieu phoi"]
        QR[Query Reform]
        OR[OrchestratorAgent]
        SY[SynthesisAgent]
        QR --> OR
    end

    subgraph L2["Tang 2 - Agents nghiep vu"]
        CC[ChitchatAgent]
        RC[RecommendationAgent]
        RS[RegistrationSelectionAgent]
    end

    subgraph L1["Tang 1 - Skills + Tools"]
        BM[Book Matching Skill]
        MC[Membership Comparison Skill]
        AG[Account Guidance Skill]
        PS[Preference Store]
        TB[search_books]
        TC[get_categories]
        TA[get_authors]
        TP[get_publishers]
        TM[get_membership_plans]
        TW[web_search_books]
        TV[verify_books_in_library]
    end

    API --> QR
    OR --> CC
    OR --> RC
    OR --> RS
    RC --> BM
    RS --> MC
    RS --> AG
    RC --> PS
    BM --> TB
    BM --> TW
    BM --> TV
    MC --> TM
    TV --> TB
    TB --> BE[(Backend / CSDL thu vien)]
    TC --> BE
    TA --> BE
    TP --> BE
    TM --> BE
    TW --> WEB[(Web Search)]
    CC --> SY
    RC --> SY
    RS --> SY
    SY --> API
    API --> FE
```

Rang buoc an toan:
- Sach cho phep chon/them gio phai co `_id` trong CSDL thu vien.
- Neu thu vien khong co tac pham, agent noi ro khong co va goi y sach lien quan trong CSDL neu tim duoc.
- Agent chi doc danh sach goi hoi vien, khong tu dang ky va khong tu thanh toan.
