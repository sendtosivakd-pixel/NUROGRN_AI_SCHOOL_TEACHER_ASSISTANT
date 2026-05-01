from io import BytesIO

from fastapi import UploadFile

from app.services.csv_import_service import preview_import


def make_upload_file(content: str) -> UploadFile:
    return UploadFile(filename="marks.csv", file=BytesIO(content.encode("utf-8")))


def test_preview_import_accepts_valid_csv() -> None:
    file = make_upload_file(
        "\n".join(
            [
                "exam_name,exam_type,exam_date,subject,marks_obtained,max_marks",
                "March Test,monthly_test,2026-03-12,Mathematics,76,100",
                "March Test,monthly_test,2026-03-12,Science,82,100",
            ]
        )
    )

    preview = preview_import(file)

    assert preview["valid"] is True
    assert len(preview["rows"]) == 2
    assert preview["subject_names"] == ["Mathematics", "Science"]


def test_preview_import_rejects_invalid_headers() -> None:
    file = make_upload_file(
        "\n".join(
            [
                "exam,type,date,subject,score,max",
                "March Test,monthly_test,2026-03-12,Mathematics,76,100",
            ]
        )
    )

    preview = preview_import(file)

    assert preview["valid"] is False
    assert preview["errors"][0]["row_number"] == 0
