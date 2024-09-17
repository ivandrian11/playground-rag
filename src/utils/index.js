export function cleanToMarkdown(text) {
  // Mengganti tag <a> dengan format markdown link
  text = text.replace(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '[$2]($1)')

  // Mengambil nilai properti text dari <Collapsible> dan menggantinya dalam teks
  text = text.replace(/<Collapsible[^>]*text="([^"]+)"[^>]*>/g, '#### $1')

  // Mengambil nilai properti title dari <Callout> dan menggantinya dalam teks
  text = text.replace(/<Callout[^>]*title="([^"]+)"[^>]*>/g, '')

  // Mengambil nilai properti title dari <CalloutSubmission> dan menggantinya dalam teks
  text = text.replace(
    /<CalloutSubmission[^>]*variant="([^"]+)"[^>]*>/g,
    '##### $1'
  )

  // Menghapus tag <Collapsible>, <Callout>, <CalloutSubmission> tanpa menghapus isinya
  text = text.replace(/<\/?(Collapsible|Callout|CalloutSubmission)[^>]*>/g, '')

  // Menghapus baris baru yang lebih dari satu
  text = text.replace(/\n{2,}/g, '\n')

  return text
}
