from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class DomainError(Exception):
    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class UnsupportedFileType(DomainError):
    pass


class FileTooLarge(DomainError):
    pass


class TooManyPages(DomainError):
    pass


class EmptyDocument(DomainError):
    pass


class NoResumeUploaded(DomainError):
    pass


class DailyTokenLimitExceeded(DomainError):
    pass


class JobNotFound(DomainError):
    pass


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(UnsupportedFileType)
    async def _unsupported(_: Request, exc: UnsupportedFileType) -> JSONResponse:
        return JSONResponse(status_code=415, content={"detail": exc.message})

    @app.exception_handler(FileTooLarge)
    async def _too_large(_: Request, exc: FileTooLarge) -> JSONResponse:
        return JSONResponse(status_code=413, content={"detail": exc.message})

    @app.exception_handler(TooManyPages)
    async def _too_many_pages(_: Request, exc: TooManyPages) -> JSONResponse:
        return JSONResponse(status_code=422, content={"detail": exc.message})

    @app.exception_handler(EmptyDocument)
    async def _empty(_: Request, exc: EmptyDocument) -> JSONResponse:
        return JSONResponse(status_code=422, content={"detail": exc.message})

    @app.exception_handler(NoResumeUploaded)
    async def _no_resume(_: Request, exc: NoResumeUploaded) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": exc.message})

    @app.exception_handler(DailyTokenLimitExceeded)
    async def _rate_limit(_: Request, exc: DailyTokenLimitExceeded) -> JSONResponse:
        return JSONResponse(status_code=429, content={"detail": exc.message})

    @app.exception_handler(JobNotFound)
    async def _job_not_found(_: Request, exc: JobNotFound) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": exc.message})
