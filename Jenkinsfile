pipeline {
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '15'))
        disableConcurrentBuilds()
        skipStagesAfterUnstable()
    }
    environment {
      PATH = "/usr/local/bin/:$PATH"
      COMPOSE_PROJECT_NAME = "${env.JOB_NAME}-${BRANCH_NAME}"
    }
    stages {
        stage('Preparation') {
            steps {
                checkout scm

                withCredentials([usernamePassword(
                  credentialsId: "cad2f741-7b1e-4ddd-b5ca-2959d40f62c2",
                  usernameVariable: "USER",
                  passwordVariable: "PASS"
                )]) {
                    sh 'set +x'
                    sh 'docker login -u $USER -p $PASS'
                }
                script {
                    def properties = readProperties file: 'project.properties'
                    if (!properties.version) {
                        error("version property not found")
                    }
                    VERSION = properties.version
                    currentBuild.displayName += " - " + VERSION
                }
            }
            post {
                failure {
                    script {
                        notifyAfterFailure()
                    }
                }
            }
        }
        stage('Build') {
            steps {
                withCredentials([file(credentialsId: '8da5ba56-8ebb-4a6a-bdb5-43c9d0efb120', variable: 'ENV_FILE')]) {
                    script {
                        try {
                            sh '''
                                rm -f .env
                                cp $ENV_FILE .env
                                if [ "$GIT_BRANCH" != "master" ]; then
                                    sed -i '' -e "s#^TRANSIFEX_PUSH=.*#TRANSIFEX_PUSH=false#" .env  2>/dev/null || true
                                fi
                                export UID=$UID
                                docker-compose pull
                                docker-compose down --volumes
                                docker-compose run --entrypoint /dev-ui/build.sh stockmanagement-ui
                                docker-compose build image
                                docker-compose down --volumes
                            '''
                        }
                        catch (exc) {
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }
            }
            post {
                success {
                    archive 'build/styleguide/*, build/styleguide/**/*, build/docs/*, build/docs/**/*, build/messages/*'
                }
                unstable {
                    script {
                        notifyAfterFailure()
                    }
                }
                failure {
                    script {
                        notifyAfterFailure()
                    }
                }
                always {
                    junit '**/build/test/test-results/*.xml'
                }
            }
        }
        stage('Build reference-ui') {
            when {
                expression {
                    return env.GIT_BRANCH == 'master'
                }
            }
            steps {
                sh "docker tag siglusdevops/stockmanagement-ui:latest siglusdevops/stockmanagement-ui:${VERSION}"
                sh "docker push siglusdevops/stockmanagement-ui:${VERSION}"
                build job: 'OpenLMIS-reference-ui-pipeline/master', wait: false
            }
            post {
                failure {
                    script {
                        notifyAfterFailure()
                    }
                }
            }
        }
        stage('Sonar analysis') {
            steps {
                withSonarQubeEnv('Sonar OpenLMIS') {
                    withCredentials([string(credentialsId: 'SONAR_LOGIN', variable: 'SONAR_LOGIN'), string(credentialsId: 'SONAR_PASSWORD', variable: 'SONAR_PASSWORD')]) {
                        script {
                            try {
                                sh '''
                                    set +x

                                    sudo rm -f .env
                                    touch .env

                                    SONAR_LOGIN_TEMP=$(echo $SONAR_LOGIN | cut -f2 -d=)
                                    SONAR_PASSWORD_TEMP=$(echo $SONAR_PASSWORD | cut -f2 -d=)
                                    echo "SONAR_LOGIN=$SONAR_LOGIN_TEMP" >> .env
                                    echo "SONAR_PASSWORD=$SONAR_PASSWORD_TEMP" >> .env
                                    echo "SONAR_BRANCH=$GIT_BRANCH" >> .env

                                    docker-compose run --entrypoint ./sonar.sh stockmanagement-ui
                                    docker-compose down --volumes
                                    sudo rm -rf node_modules/
                                '''
                                // workaround because sonar plugin retrieve the path directly from the output
                                sh 'echo "Working dir: ${WORKSPACE}/.sonar"'
                            }
                            catch (exc) {
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
                timeout(time: 1, unit: 'HOURS') {
                    script {
                        def gate = waitForQualityGate()
                        if (gate.status != 'OK') {
                            error 'Quality Gate FAILED'
                        }
                    }
                }
            }
            post {
                unstable {
                    script {
                        notifyAfterFailure()
                    }
                }
                failure {
                    script {
                        notifyAfterFailure()
                    }
                }
            }
        }
        stage('Push image') {
            when {
                expression {
                    return env.GIT_BRANCH == 'master' || env.GIT_BRANCH =~ /rel-.+/
                }
            }
            steps {
                sh "docker tag siglusdevops/stockmanagement-ui:latest siglusdevops/stockmanagement-ui:${VERSION}"
                sh "docker push siglusdevops/stockmanagement-ui:${VERSION}"
            }
            post {
                success {
                    script {
                        if (!VERSION.endsWith("SNAPSHOT")) {
                            currentBuild.setKeepLog(true)
                        }
                    }
                }
                failure {
                    script {
                        notifyAfterFailure()
                    }
                }
            }
        }
    }
    post {
        fixed {
            script {
                BRANCH = "${env.GIT_BRANCH}".trim()
                if (BRANCH.equals("master") || BRANCH.startsWith("rel-")) {
                    slackSend color: 'good', message: "${env.JOB_NAME} - #${env.BUILD_NUMBER} Back to normal"
                }
            }
        }
    }
}

def notifyAfterFailure() {
    BRANCH = "${env.GIT_BRANCH}".trim()
    if (BRANCH.equals("master") || BRANCH.startsWith("rel-")) {
        slackSend color: 'danger', message: "${env.JOB_NAME} - #${env.BUILD_NUMBER} ${env.STAGE_NAME} ${currentBuild.result} (<${env.BUILD_URL}|Open>)"
    }
    emailext subject: "${env.JOB_NAME} - #${env.BUILD_NUMBER} ${env.STAGE_NAME} ${currentBuild.result}",
        body: """<p>${env.JOB_NAME} - #${env.BUILD_NUMBER} ${env.STAGE_NAME} ${currentBuild.result}</p><p>Check console <a href="${env.BUILD_URL}">output</a> to view the results.</p>""",
        recipientProviders: [[$class: 'CulpritsRecipientProvider'], [$class: 'DevelopersRecipientProvider']]
}
