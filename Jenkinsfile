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
      COMPOSE_HTTP_TIMEOUT = 120
    }
    stages {
        stage('Preparation') {
            steps {
                script {
                    def properties = readProperties file: 'project.properties'
                    if (!properties.version) {
                        error("version property not found")
                    }
                    env.VERSION = properties.version
                    env.GIT_REVISION=sh(returnStdout: true, script: '''echo $(git rev-parse HEAD)''').trim()
                    env.PROJECT_NAME=sh(returnStdout: true, script: '''echo ${JOB_NAME%/*}''').trim()
                    env.PROJECT_SHORT_NAME=sh(returnStdout: true, script: '''echo ${PROJECT_NAME#*-}''').trim()

                    DOCKER_ORG="siglusdevops"
                    env.IMAGE_REPO= DOCKER_ORG + "/" + env.PROJECT_SHORT_NAME
                    currentBuild.displayName += " - " + VERSION
                    sh "printenv"
                }
                withCredentials([file(credentialsId: '8da5ba56-8ebb-4a6a-bdb5-43c9d0efb120', variable: 'ENV_FILE')]) {
                    script {
                        sh '''
                            rm -f .env
                            cp $ENV_FILE .env
                            if [ "$GIT_BRANCH" != "master" ]; then
                                sed -i '' -e "s#^TRANSIFEX_PUSH=.*#TRANSIFEX_PUSH=false#" .env  2>/dev/null || true
                            fi
                        '''
                    }
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
        stage('Build and Test App') {
            steps {
                script {
                        try {
                            sh '''
                                export "UID=`id -u jenkins`"
                                docker-compose down --volumes
                                docker-compose pull
                                docker-compose run --entrypoint /dev-ui/build.sh ${PROJECT_SHORT_NAME}
                            '''
                        }
                        catch (exc) {
                            currentBuild.result = 'UNSTABLE'
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
        stage('Build and Push Image') {
            steps {
                withCredentials([usernamePassword(
                              credentialsId: "cad2f741-7b1e-4ddd-b5ca-2959d40f62c2",
                              usernameVariable: "USER",
                              passwordVariable: "PASS"
                            )]) {
                      sh 'set +x'
                      sh 'docker login -u $USER -p $PASS'
                }
                script {
                        try {
                            sh '''
                                export "UID=`id -u jenkins`"
                                docker-compose build image
                                docker tag ${IMAGE_REPO}:latest ${IMAGE_REPO}:${VERSION}
                                docker push ${IMAGE_REPO}:${VERSION}
                                docker push ${IMAGE_REPO}:latest
                            '''
                        }
                        catch (exc) {
                            currentBuild.result = 'UNSTABLE'
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
                always {
                    sh '''
                        docker rmi ${IMAGE_REPO}:${VERSION}
                        docker-compose down --volumes
                    '''
                }
            }
        }

        stage('Notify to build reference-ui') {
            when {
                expression {
                    return env.GIT_BRANCH == 'master'
                }
            }
            steps {
                build job: 'openlmis-reference-ui/master', wait: true
            }
            post {
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
                    // slackSend color: 'good', message: "${env.JOB_NAME} - #${env.BUILD_NUMBER} Back to normal"
                }
            }
        }
    }
}

def notifyAfterFailure() {
    // BRANCH = "${env.GIT_BRANCH}".trim()
    // if (BRANCH.equals("master") || BRANCH.startsWith("rel-")) {
    //     slackSend color: 'danger', message: "${env.JOB_NAME} - #${env.BUILD_NUMBER} ${env.STAGE_NAME} ${currentBuild.result} (<${env.BUILD_URL}|Open>)"
    // }
    // emailext subject: "${env.JOB_NAME} - #${env.BUILD_NUMBER} ${env.STAGE_NAME} ${currentBuild.result}",
    //     body: """<p>${env.JOB_NAME} - #${env.BUILD_NUMBER} ${env.STAGE_NAME} ${currentBuild.result}</p><p>Check console <a href="${env.BUILD_URL}">output</a> to view the results.</p>""",
    //     recipientProviders: [[$class: 'CulpritsRecipientProvider'], [$class: 'DevelopersRecipientProvider']]
}
