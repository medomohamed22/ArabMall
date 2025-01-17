interface PaymentResponse {
  paymentId: string;
  status: string;
  message: string;
}

class PaymentProcessor {
  private apiUrl: string = '/api/payments';
  private paymentStatus: HTMLElement;

  constructor() {
    this.paymentStatus = document.getElementById('paymentStatus') !;
    this.initializePaymentButton();
  }

  private initializePaymentButton(): void {
    const payButton = document.getElementById('payButton');
    if (payButton) {
      payButton.addEventListener('click', () => this.handlePayment());
    }
  }

  private async handlePayment(): Promise < void > {
    try {
      // First, approve the payment
      const approveResponse = await this.approvePayment();

      if (approveResponse.status === 'success') {
        // Then attempt to complete the payment
        const completeResponse = await this.completePayment(approveResponse.paymentId);
        this.showStatus('تم الدفع بنجاح!', 'success');
      } else {
        this.showStatus('فشل في معالجة الدفع', 'error');
      }
    } catch (error) {
      this.showStatus('حدث خطأ أثناء معالجة الدفع', 'error');
      console.error('Payment error:', error);
    }
  }

  private async approvePayment(): Promise < PaymentResponse > {
    const response = await fetch(`${this.apiUrl}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: '123', // Replace with actual product ID
        amount: 100
      })
    });
    return response.json();
  }

  private async completePayment(paymentId: string): Promise < PaymentResponse > {
    const response = await fetch(`${this.apiUrl}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentId,
        txid: 'transaction_id' // This would come from the blockchain
      })
    });
    return response.json();
  }

  private showStatus(message: string, type: 'success' | 'error'): void {
    if (this.paymentStatus) {
      this.paymentStatus.textContent = message;
      this.paymentStatus.className = `payment-status ${type}`;
    }
  }
}

// Initialize the payment processor when the document loads
document.addEventListener('DOMContentLoaded', () => {
  new PaymentProcessor();
});
