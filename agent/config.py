# Chuc nang: Cau hinh model adapters cho agent thu vien.

import io
import os
import sys
from typing import Any, Optional
from dotenv import load_dotenv

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

load_dotenv()

MODEL_ORCHESTRATOR_GPT = "gpt-4o-mini"
MODEL_SUB_AGENT_GPT = "gpt-4o-mini"
MODEL_LIGHTWEIGHT_GPT = "gpt-4o-mini"
GITHUB_MODELS_ENDPOINT = "https://models.inference.ai.azure.com"

MODEL_ORCHESTRATOR_GEMINI = "gemini-3.5-flash-lite"
MODEL_SUB_AGENT_GEMINI = "gemini-3.5-flash"
MODEL_LIGHTWEIGHT_GEMINI = "gemini-2.5-flash-lite"

DEFAULT_PROVIDER = os.getenv("LLM_PROVIDER", "openai")


class OpenAIModelAdapter:
    def __init__(self, client: Any, model_name: str):
        self.client = client
        self.model_name = model_name

    def generate(self, messages: list, response_schema: Optional[Any] = None, **kwargs) -> str:
        if response_schema:
            import json
            from pydantic import BaseModel
            if isinstance(response_schema, type) and issubclass(response_schema, BaseModel):
                try:
                    response = self.client.beta.chat.completions.parse(
                        model=self.model_name,
                        messages=messages,
                        response_format=response_schema,
                        **kwargs,
                    )
                    return response.choices[0].message.content
                except Exception as beta_err:
                    print(f"[WARNING] OpenAI beta parse failed ({beta_err}). Triggering json_object fallback.")
                    schema_json = json.dumps(response_schema.model_json_schema(), ensure_ascii=False)
                    messages = [dict(m) for m in messages]
                    messages[-1]["content"] += "\n\nTra ve JSON dung schema sau, khong markdown:\n" + schema_json
                    kwargs["response_format"] = {"type": "json_object"}

        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=messages,
            **kwargs,
        )
        return response.choices[0].message.content


class GeminiModelAdapter:
    def __init__(self, client: Any, model_name: str):
        self.client = client
        self.model_name = model_name

    def generate(self, messages: list, response_schema: Optional[Any] = None, **kwargs) -> str:
        system_instruction = None
        contents = []
        for msg in messages:
            if msg["role"] == "system":
                system_instruction = msg["content"]
            else:
                role = "user" if msg["role"] == "user" else "model"
                contents.append({"role": role, "parts": [{"text": msg["content"]}]})

        config = {}
        if system_instruction:
            config["system_instruction"] = system_instruction
        if response_schema:
            config["response_mime_type"] = "application/json"
            config["response_schema"] = response_schema

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=config if config else None,
            )
            return response.text
        except Exception as e:
            print(f"[WARNING] Gemini generate_content failed ({e}). Retrying without schema constraint.")
            config.pop("response_schema", None)
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=config if config else None,
            )
            return response.text


def get_ai_model(model_name: str, provider: str = DEFAULT_PROVIDER) -> Any:
    provider = provider.lower()
    if provider == "openai" and "gemini" in model_name.lower():
        model_name = MODEL_LIGHTWEIGHT_GPT
    elif provider == "gemini" and ("gpt" in model_name.lower() or "openai" in model_name.lower()):
        model_name = MODEL_SUB_AGENT_GEMINI

    if provider == "openai":
        from openai import OpenAI
        api_key = os.getenv("GITHUB_TOKEN") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("Thieu cau hinh GITHUB_TOKEN hoac OPENAI_API_KEY trong .env")
        base_url = GITHUB_MODELS_ENDPOINT if os.getenv("GITHUB_TOKEN") else None
        return OpenAIModelAdapter(OpenAI(base_url=base_url, api_key=api_key), model_name)

    if provider == "gemini":
        from google import genai
        api_key = os.getenv("Gemini_OpenAI") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("Thieu cau hinh Gemini_OpenAI hoac GEMINI_API_KEY trong .env")
        return GeminiModelAdapter(genai.Client(api_key=api_key), model_name)

    raise ValueError(f"Nha cung cap '{provider}' khong duoc ho tro")
