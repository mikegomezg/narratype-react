from __future__ import annotations

from kedro.pipeline import Pipeline

from narratype_pipeline.pipelines.text_ingestion.pipeline import create_pipeline as create_text_ingestion_pipeline


def register_pipelines() -> dict[str, Pipeline]:
    return {
        "__default__": create_text_ingestion_pipeline(),
        "text_ingestion": create_text_ingestion_pipeline(),
    }
