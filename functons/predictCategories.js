import { spawn } from 'child_process'
import { configDotenv } from 'dotenv'; configDotenv()
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default function predictCategories(textsArray) {
    if (!textsArray.length) return []

    return new Promise(resolve => {
        const pythonProcess = spawn(process.env.PYTHON_INTERPRETER_PATH, ['predict_categories.py'], { cwd: path.join(__dirname, '../py') })

        pythonProcess.stdin.write(JSON.stringify(textsArray))
        pythonProcess.stdin.end()

        let dataString = ''

        pythonProcess.stdout.on('data', data => {
            dataString += data.toString()
        })

        pythonProcess.stderr.on('data', data => {
            //throw new Error(`Python Error: ${data}`)
            console.log(`Python Error: ${data}`)
        })

        pythonProcess.on('error', err => {
            throw new Error(`Failed to start Python process: ${err.message}`)
        })

        pythonProcess.on('close', code => {
            if (code !== 0) throw new Error(`Python process exited with code ${code}`)

            resolve(JSON.parse(dataString))
        })
    })
}
