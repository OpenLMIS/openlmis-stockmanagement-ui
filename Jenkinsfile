pipeline {
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '15'))
        disableConcurrentBuilds()
    }
    environment {
      PATH = "/usr/local/bin/:$PATH"
      COMPOSE_PROJECT_NAME = "${env.JOB_BASE_NAME}-${BRANCH_NAME}"
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
                    slackSend color: 'danger', message: "${env.JOB_NAME} - #${env.BUILD_NUMBER} ${env.STAGE_NAME} FAILED (<${env.BUILD_URL}|Open>)"
                }
            }
        }
        stage('Build') {
            steps {
                withCredentials([file(credentialsId: '8da5ba56-8ebb-4a6a-bdb5-43c9d0efb120', variable: 'ENV_FILE')]) {
                    sh '''
                        sudo rm -f .env
                        cp $ENV_FILE .env
                        if [ "$GIT_BRANCH" != "master" ]; then
                            sed -i '' -e "s#^TRANSIFEX_PUSH=.*#TRANSIFEX_PUSH=false#" .env  2>/dev/null || true
                        fi
                        docker-compose pull
                        docker-compose down --volumes
                        docker-compose run --entrypoint /dev-ui/build.sh stockmanagement-ui
                        docker-compose build image
                        docker-compose down --volumes
                    '''
                }
            }
            post {
                success {
                    archive 'build/styleguide/*, build/styleguide/**/*, build/docs/*, build/docs/**/*, build/messages/*'
                }
                failure {
                    slackSend color: 'danger', message: "${env.JOB_NAME} - #${env.BUILD_NUMBER} ${env.STAGE_NAME} FAILED (<${env.BUILD_URL}|Open>)"
                }
                always {
                    junit '**/build/test/test-results/*.xml'
                }
            }
        }
        stage('Sonar analysis') {
            steps {
                withSonarQubeEnv('Sonar OpenLMIS') {
                    withCredentials([string(credentialsId: 'SONAR_LOGIN', variable: 'SONAR_LOGIN'), string(credentialsId: 'SONAR_PASSWORD', variable: 'SONAR_PASSWORD')]) {
                        sh '''
                            set +x
                            
                            sudo rm -f .env
                            touch .env
                        
                            SONAR_LOGIN_TEMP=$(echo $SONAR_LOGIN | cut -f2 -d=)
                            SONAR_PASSWORD_TEMP=$(echo $SONAR_PASSWORD | cut -f2 -d=)
                            echo "SONAR_LOGIN=$SONAR_LOGIN_TEMP" >> .env
                            echo "SONAR_PASSWORD=$SONAR_PASSWORD_TEMP" >> .env

                            docker-compose run --entrypoint ./sonar.sh stockmanagement-ui
                            docker-compose down --volumes
                        '''
                        // workaround because sonar plugin retrieve the path directly from the output
                        sh 'echo "Working dir: ${WORKSPACE}/.sonar"'
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
                failure {
                    slackSend color: 'danger', message: "${env.JOB_NAME} - #${env.BUILD_NUMBER} ${env.STAGE_NAME} FAILED (<${env.BUILD_URL}|Open>)"
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
                sh "docker tag openlmis/stockmanagement-ui:latest openlmis/stockmanagement-ui:${VERSION}"
                sh "docker push openlmis/stockmanagement-ui:${VERSION}"
            }
            post {
                failure {
                    slackSend color: 'danger', message: "${env.JOB_NAME} - #${env.BUILD_NUMBER} ${env.STAGE_NAME} FAILED (<${env.BUILD_URL}|Open>)"
                }
            }
        }
    }
    post {
        fixed {
            slackSend color: 'good', message: "${env.JOB_NAME} - #${env.BUILD_NUMBER} Back to normal"
        }
        success {
            build job: 'OpenLMIS-reference-ui-pipeline/master', wait: false
        }
    }
}
