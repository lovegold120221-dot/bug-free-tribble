import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function verifyWebhookSignature(secret: string, payload: string, payloadSignature: string) {
    const expectedSignatureRaw = crypto.createHash('sha256').update(secret + payload).digest('base64');
    const expectedSignature = expectedSignatureRaw.replace(/=+$/, '');
    return expectedSignature === payloadSignature
}

export async function POST(req: NextRequest) {
    try {
        const secret = process.env.WEBHOOK_SECRET
        if (!secret) {
            console.error("WEBHOOK_SECRET not set in environment")
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const webhookSignatureHeader = req.headers.get('x-signature') || ''
        const webhookBodyRaw = await req.text()

        const payloadValid = verifyWebhookSignature(secret, webhookBodyRaw, webhookSignatureHeader)

        if (payloadValid) {
            console.log("Payload signature is valid")
            
            // Process the validated payload here
            let payload
            try {
                payload = JSON.parse(webhookBodyRaw)
            } catch (e) {
                payload = webhookBodyRaw
            }

            console.log("Webhook payload received:", payload)

            return NextResponse.json({ status: 'ok', message: 'Payload signature is valid' })
        } else {
            console.log("Payload signature is INVALID")
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }
    } catch (error: any) {
        console.error("Webhook processing error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
