const express = require('express');
const { MB } = require('mbbank');
const app = express();
const port = 3000;

const username = '0355182426';
const password = 'Yoinehen@99.';
const accountNumber = '0355182426';

module.exports = async (req, res) => {
  try {
    const mb = new MB({ username, password });
    await mb.login();

    const balancePromise = mb.getBalance();
    const transactionsPromise = mb.getTransactionsHistory({
      accountNumber: accountNumber,
      fromDate: '15/04/2025',
      toDate: '18/04/2025',
    });

    const [balance, transactions] = await Promise.all([balancePromise, transactionsPromise]);

    const totalBalance = `${balance.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, '.')} VND`;

    res.send(`
      <!doctype html>
      <html lang="en" class="scroll-smooth">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MB Bank - Thông tin tài khoản</title>
          <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 h-screen p-4">
          <main class="container mx-auto p-4">
            <h1 class="text-3xl font-bold mb-4 text-center">Số dư tài khoản</h1>
            <div class="text-6xl font-bold mb-4 text-center">
              <span class="balance" data-value="${totalBalance}">0</span> 
              <span class="text-4xl">VND</span>
            </div>
            <h2 class="text-2xl font-bold mb-4">Lịch sử giao dịch</h2>
            <div class="overflow-x-auto">
              <input id="search" type="text" placeholder="Tìm kiếm..." class="w-full px-4 py-2 border rounded mb-4">
              <table id="transactions" class="table-auto w-full border">
                <thead>
                  <tr>
                    <th class="px-4 py-2 border">Thời gian</th>
                    <th class="px-4 py-2 border">Số tiền</th>
                    <th class="px-4 py-2 border">Nội dung</th>
                  </tr>
                </thead>
                <tbody>
                  ${transactions.map(tx => `
                    <tr class="hover:bg-gray-200">
                      <td class="px-4 py-2 border">${tx.transactionDate}</td>
                      <td class="px-4 py-2 border">${(tx.creditAmount || tx.debitAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, '.') || '0'}</td>
                      <td class="px-4 py-2 border">${tx.transactionDesc}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <script>
              const balanceElement = document.querySelector('.balance');
              const animationDuration = 1000;
              const startValue = 0;
              const endValue = parseFloat(balanceElement.dataset.value);
              const step = (endValue - startValue) / animationDuration * 50;

              let currentValue = startValue;
              const intervalId = setInterval(() => {
                currentValue += step;
                if (currentValue >= endValue) {
                  clearInterval(intervalId);
                  balanceElement.textContent = endValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).replace(/,/g, '.');
                } else {
                  balanceElement.textContent = currentValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).replace(/,/g, '.');
                }
              }, 50);
            </script>
          </main>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`Lỗi: ${error.message}`);
  }
};

app.listen(port, () => {
  console.log(`Ứng dụng đang chạy tại http://localhost:${port}`);
});

