export const parseThreadContent = (thread_content: string) => {
  const index = thread_content.indexOf('\n')
  let title: string | undefined, content: string
  if (index === -1) {
    title = thread_content
    content = ''
  } else {
    title = thread_content.slice(0, index)
    content = thread_content.slice(index + 1)
  }
  return {
    thread_title: title,
    thread_content: content,
  }
}
