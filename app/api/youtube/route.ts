import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  const API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyDummy_Key_For_Demo'

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 12,
        key: API_KEY,
        regionCode: 'BR',
        relevanceLanguage: 'pt'
      }
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('YouTube API Error:', error.response?.data || error.message)

    // Fallback com dados mockados para demonstração
    const mockData = {
      items: [
        {
          id: { videoId: 'dQw4w9WgXcQ' },
          snippet: {
            title: `Vídeo sobre ${query} - Exemplo 1`,
            channelTitle: 'Canal Exemplo',
            thumbnails: {
              medium: {
                url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
              }
            }
          }
        },
        {
          id: { videoId: 'jNQXAC9IVRw' },
          snippet: {
            title: `Tutorial de ${query} - Exemplo 2`,
            channelTitle: 'Canal Tutorial',
            thumbnails: {
              medium: {
                url: 'https://i.ytimg.com/vi/jNQXAC9IVRw/mqdefault.jpg'
              }
            }
          }
        },
        {
          id: { videoId: '9bZkp7q19f0' },
          snippet: {
            title: `Aprenda ${query} - Exemplo 3`,
            channelTitle: 'Canal Educativo',
            thumbnails: {
              medium: {
                url: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg'
              }
            }
          }
        }
      ]
    }

    return NextResponse.json(mockData)
  }
}
