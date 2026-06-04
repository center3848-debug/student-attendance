/**
 * พิมพ์เฉพาะ DOM node ที่ต้องการ โดยเปิดหน้าต่างใหม่และคัดลอก stylesheet
 * ทั้งหมดของหน้าเดิมมาด้วย เพื่อให้คลาส Tailwind แสดงผลเหมือนบนหน้าจอ.
 * รูป QR เป็น data URL จึงโหลดทันที ไม่ต้องรอเครือข่าย.
 */
export function printNode(node: HTMLElement, title = 'พิมพ์บัตรนักเรียน') {
  const win = window.open('', '_blank', 'width=900,height=650')
  if (!win) {
    alert('เบราว์เซอร์บล็อกการเปิดหน้าต่างพิมพ์ กรุณาอนุญาต popup แล้วลองใหม่')
    return
  }
  const styles = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]')
  )
    .map(el => el.outerHTML)
    .join('\n')

  // <base> สำคัญ: ป๊อปอัป about:blank ต้องมี origin เพื่อ resolve
  // <link href="/_next/static/css/..."> ของ Tailwind ใน production มิฉะนั้นบัตรพิมพ์ออกมาไม่มีสไตล์
  win.document.write(`<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8" />
<base href="${location.origin}/" />
<title>${title}</title>
${styles}
<style>
  @page { margin: 8mm; }
  body { background: #fff; margin: 0; padding: 16px; }
  .no-print { display: none !important; }
  .print-grid { display: flex; flex-wrap: wrap; gap: 16px; }
  @media print { .print-grid { gap: 12px; } }
</style>
</head>
<body>
<div class="print-grid">${node.innerHTML}</div>
</body>
</html>`)
  win.document.close()

  // สั่งพิมพ์เมื่อ stylesheet โหลดเสร็จ (onload) ไม่ใช่หน่วงเวลาคงที่ที่อาจชิงพิมพ์ก่อน CSS มา
  let printed = false
  const triggerPrint = () => {
    if (printed || win.closed) return
    printed = true
    win.focus()
    win.print()
    win.close()
  }
  win.onload = triggerPrint
  // fallback เผื่อ onload ยิงไปแล้วหรือไม่ยิง
  setTimeout(triggerPrint, 2000)
}
