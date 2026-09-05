"""
Trust Layer — Webhook Signature Verification

Simulates Razorpay's HMAC-SHA256 webhook signature verification.
Uses hmac.compare_digest for timing-attack resistance.

Fraud vector defended: Tampered/forged webhook payloads.
"""
from __future__ import annotations
import hmac
import hashlib
import json
from typing import Tuple

from config import WEBHOOK_SECRET, ReasonCode
from trust.exceptions import ExceptionLogger


def compute_signature(payload: str, secret: str = WEBHOOK_SECRET) -> str:
    """Compute HMAC-SHA256 signature for a payload string."""
    return hmac.new(
        key=secret.encode("utf-8"),
        msg=payload.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()


def verify_signature(
    payload: str,
    provided_signature: str,
    secret: str = WEBHOOK_SECRET,
) -> bool:
    """
    Verify a webhook payload signature using constant-time comparison.
    
    Args:
        payload: Raw JSON string of the webhook body
        provided_signature: The signature sent with the webhook
        secret: The webhook secret key
        
    Returns:
        True if signature matches, False otherwise
    """
    expected = compute_signature(payload, secret)
    return hmac.compare_digest(expected, provided_signature)


def validate_settlement_signatures(
    settlements: list[dict],
    exception_logger: ExceptionLogger,
    secret: str = WEBHOOK_SECRET,
) -> Tuple[list[dict], list[dict]]:
    """
    Validate signatures on a batch of settlement webhook payloads.
    
    Returns:
        (valid_settlements, invalid_settlements)
        Invalid ones are logged to the exception logger.
    """
    valid = []
    invalid = []

    for settlement in settlements:
        sig = settlement.get("signature", "")
        # Build the payload string (everything except the signature itself)
        payload_data = {k: v for k, v in settlement.items() if k != "signature"}
        payload_str = json.dumps(payload_data, sort_keys=True, separators=(",", ":"))

        if not sig:
            exception_logger.log(
                record_id=settlement.get("id", "UNKNOWN"),
                source="settlement",
                reason_code=ReasonCode.SIG_INVALID,
                details="Missing signature field — payload cannot be verified",
                severity="HIGH",
            )
            invalid.append(settlement)
        elif not verify_signature(payload_str, sig, secret):
            exception_logger.log(
                record_id=settlement.get("id", "UNKNOWN"),
                source="settlement",
                reason_code=ReasonCode.SIG_INVALID,
                details=f"HMAC-SHA256 signature mismatch — possible tampering",
                severity="HIGH",
            )
            invalid.append(settlement)
        else:
            valid.append(settlement)

    return valid, invalid
