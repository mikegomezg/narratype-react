from kedro.pipeline import Pipeline, node, pipeline

from .nodes import scan_text_files, validate_texts


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline(
        [
            node(
                func=scan_text_files,
                inputs="params:input_dir",
                outputs="raw_texts",
                name="scan_text_files_node"
            ),
            node(
                func=validate_texts,
                inputs="raw_texts",
                outputs="validated_texts",
                name="validate_texts_node"
            ),
        ]
    )
